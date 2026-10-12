import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type {
  ContactFields,
  ContactFieldErrors,
  ContactFormState,
  ContactResponse,
} from '../../shared/contact';
import {
  ArrowUpRight,
  CheckCircle2,
  Github,
  Mail,
  MapPin,
  Phone,
  Send,
} from 'lucide-react';

const emptyValues: ContactFields = {
  name: '',
  email: '',
  subject: '',
  message: '',
  website: '',
};
export default function Contact() {
  const [values, setValues] = useState(emptyValues);
  const [state, setState] = useState<ContactFormState>('idle');
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [feedback, setFeedback] = useState('');
  const submitting = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  function update(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const fields: ContactFieldErrors = {};
    if (values.name.trim().length < 2)
      fields.name = 'Please enter at least 2 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      fields.email = 'Please enter a valid email address.';
    if (!values.subject) fields.subject = 'Please choose a subject.';
    if (values.message.trim().length < 20)
      fields.message = 'Please write at least 20 characters.';
    setErrors(fields);
    if (Object.keys(fields).length) {
      setState('error');
      setFeedback('Please check the highlighted fields.');
      const firstField = formRef.current?.elements.namedItem(
        Object.keys(fields)[0],
      );
      if (firstField instanceof HTMLElement) firstField.focus();
      return;
    }
    submitting.current = true;
    setState('sending');
    setFeedback('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        signal: AbortSignal.timeout(15000),
      });
      const result: ContactResponse = await response.json().catch(() => ({}));
      if (!response.ok || typeof result.message !== 'string') {
        setErrors(result.fields || {});
        throw new Error(
          result.error ||
            'Your message could not be saved. Please try again or email me directly.',
        );
      }
      setState('success');
      setFeedback(
        result.message || 'Message received. Thank you for reaching out.',
      );
      setValues(emptyValues);
    } catch (error) {
      setState('error');
      setFeedback(
        error instanceof Error && error.name === 'TimeoutError'
          ? 'The request timed out, so receipt could not be confirmed. Please email me directly.'
          : error instanceof TypeError
            ? 'Unable to connect. Please try again or email me directly.'
            : error instanceof Error
              ? error.message
              : 'Your message could not be saved. Please email me directly.',
      );
    } finally {
      submitting.current = false;
    }
  }
  const fieldProps = (name: keyof ContactFields) => ({
    name,
    id: `contact-${name}`,
    value: values[name],
    onChange: update,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${name}-error` : undefined,
  });
  return (
    <section className="contact-wrap">
      <div id="contact" className="section shell contact-layout">
        <div className="contact-copy">
          <p className="eyebrow">
            <span>05</span> / START A CONVERSATION
          </p>
          <h2>
            Let’s build
            <br />
            something <span>that matters.</span>
          </h2>
          <p>
            I’m looking for software development opportunities where curiosity,
            ownership, and a security mindset make a difference.
          </p>
          <a
            className="contact-email"
            href="mailto:jason@jasonbreedlove.dev"
          >
            jason@jasonbreedlove.dev{' '}
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
          <div className="contact-facts">
            <a href="tel:+19162519259">
              <Phone size={16} aria-hidden="true" />
              916-251-9259
            </a>
            <address>
              <MapPin size={17} aria-hidden="true" />
              <span>Auburn, California</span>
            </address>
            <a
              href="https://github.com/Breedlove-Jason"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={17} aria-hidden="true" />
              Breedlove-Jason <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="contact-form-panel">
          <div className="form-heading">
            <Mail size={20} strokeWidth={1.5} aria-hidden="true" />
            <h3>Send a message</h3>
          </div>
          <form
            ref={formRef}
            onSubmit={submit}
            noValidate
            aria-busy={state === 'sending'}
          >
            <fieldset disabled={state === 'sending'}>
              <legend className="sr-only">
                Your contact details and message
              </legend>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="contact-name">Your name</label>
                  <input
                    {...fieldProps('name')}
                    placeholder="Name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                  />
                  {errors.name && (
                    <p className="field-error" id="name-error">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="contact-email">Email address</label>
                  <input
                    {...fieldProps('email')}
                    placeholder="you@company.com"
                    autoComplete="email"
                    type="email"
                    required
                    maxLength={254}
                  />
                  {errors.email && (
                    <p className="field-error" id="email-error">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
              <div className="field">
                <label htmlFor="contact-subject">What’s on your mind?</label>
                <select {...fieldProps('subject')} required>
                  <option value="" disabled>
                    Select a subject
                  </option>
                  <option>Software development opportunity</option>
                  <option>Project collaboration</option>
                  <option>Discuss a portfolio project</option>
                  <option>Something else</option>
                </select>
                {errors.subject && (
                  <p className="field-error" id="subject-error">
                    {errors.subject}
                  </p>
                )}
              </div>
              <div className="field">
                <div className="message-label">
                  <label htmlFor="contact-message">Your message</label>
                  <span>{values.message.length.toLocaleString()} / 4,000</span>
                </div>
                <textarea
                  {...fieldProps('message')}
                  placeholder="Tell me a little about what you’re building…"
                  rows={5}
                  required
                  minLength={20}
                  maxLength={4000}
                />
                {errors.message && (
                  <p className="field-error" id="message-error">
                    {errors.message}
                  </p>
                )}
              </div>
              <div className="honeypot" aria-hidden="true">
                <label htmlFor="contact-website">Leave this field empty</label>
                <input
                  {...fieldProps('website')}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <button
                className="button button-primary send-button"
                type="submit"
              >
                {state === 'sending' ? 'Saving your message…' : 'Send message'}
                <Send size={17} aria-hidden="true" />
              </button>
            </fieldset>
            <div
              className={`form-feedback feedback-${state}`}
              role={state === 'error' ? 'alert' : 'status'}
              aria-live="polite"
            >
              {feedback && (
                <>
                  {state === 'success' && (
                    <CheckCircle2 size={18} aria-hidden="true" />
                  )}
                  <span>{feedback}</span>
                </>
              )}
            </div>
            <p className="form-privacy">
              Your details are used only to respond to your inquiry.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
