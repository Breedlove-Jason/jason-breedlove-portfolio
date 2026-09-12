import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { ErrorRequestHandler, Express } from 'express';
import type { ContactStore } from './store.js';

interface AppOptions {
  store: Pick<ContactStore, 'save'>;
  allowedOrigins?: string[];
  production?: boolean;
  trustProxyHops?: number;
  maxRequests?: number;
  staticDir?: string;
}

const oneLine = z
  .string()
  .trim()
  .refine((value) => !/[\r\n\u0000]/.test(value), 'Use a single line of text.');
export const contactSchema = z
  .object({
    name: oneLine.pipe(
      z.string().min(2, 'Enter at least 2 characters.').max(100),
    ),
    email: z.string().trim().max(254).email('Enter a valid email address.'),
    subject: oneLine.pipe(z.string().min(2, 'Choose a subject.').max(160)),
    message: z
      .string()
      .trim()
      .min(20, 'Please write at least 20 characters.')
      .max(4000, 'Please keep your message under 4,000 characters.')
      .refine(
        (value) => !value.includes('\u0000'),
        'Remove invalid characters.',
      ),
    website: z.string().max(200).optional().default(''),
  })
  .strict();

export function createApp({
  store,
  allowedOrigins = [],
  production = false,
  trustProxyHops = 0,
  maxRequests = 5,
  staticDir = fileURLToPath(new URL('../../dist', import.meta.url)),
}: AppOptions): Express {
  const app = express();
  app.disable('x-powered-by');
  if (trustProxyHops > 0) app.set('trust proxy', trustProxyHops);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          fontSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: production ? [] : null,
        },
      },
      strictTransportSecurity: production,
    }),
  );
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/contact', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: maxRequests,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      error:
        'Too many messages. Please try again in 15 minutes or email Jason directly.',
    },
  });
  app.post(
    '/api/contact',
    limiter,
    (req, res, next) => {
      const origin = req.get('origin');
      if (
        (origin && !allowedOrigins.includes(origin)) ||
        req.get('sec-fetch-site') === 'cross-site'
      ) {
        return res.status(403).json({ error: 'This origin is not permitted.' });
      }
      if (!req.is('application/json'))
        return res
          .status(415)
          .json({ error: 'Send the contact form as JSON.' });
      next();
    },
    express.json({ limit: '24kb' }),
    (req, res, next) => {
      const parsed = contactSchema.safeParse(req.body);
      if (!parsed.success) {
        const fields: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const key = String(issue.path[0] ?? '');
          if (key && !fields[key]) fields[key] = issue.message;
        }
        return res
          .status(422)
          .json({ error: 'Please check the highlighted fields.', fields });
      }
      if (parsed.data.website)
        return res
          .status(200)
          .json({ message: 'Message received. Thank you for reaching out.' });
      try {
        const id = store.save(parsed.data);
        return res.status(201).json({
          id,
          message: 'Message received. Thank you for reaching out.',
        });
      } catch (error) {
        next(error);
      }
    },
  );
  app.all('/api/contact', (_req, res) =>
    res
      .set('Allow', 'POST')
      .status(405)
      .json({ error: 'Use POST to submit a message.' }),
  );
  app.use('/api', (_req, res) =>
    res.status(404).json({ error: 'API endpoint not found.' }),
  );
  if (existsSync(staticDir)) {
    app.use(express.static(staticDir, { index: 'index.html' }));
  }
  app.use((_req, res) => res.status(404).type('text').send('Page not found.'));
  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error.type === 'entity.too.large')
      return res.status(413).json({ error: 'This message is too large.' });
    if (error.type === 'entity.parse.failed')
      return res.status(400).json({ error: 'Invalid JSON request.' });
    console.error('Contact persistence failed:', error.code || error.name);
    return res.status(503).json({
      error:
        'Your message could not be saved. Please try again or email Jason directly.',
    });
  };
  app.use(errorHandler);
  return app;
}
