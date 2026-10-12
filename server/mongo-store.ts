import { MongoClient } from 'mongodb';
import { randomUUID } from 'node:crypto';
import type { ContactFields } from '../shared/contact.js';

export async function createMongoStore() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required.');

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await client.connect();
    await client.db('portfolio').command({ ping: 1 });
  } catch {
    await client.close();
    throw new Error('Unable to connect to the portfolio database.');
  }

  const messages = client
    .db('portfolio')
    .collection<{
      _id: string;
      name: string;
      email: string;
      subject: string;
      message: string;
      created_at: Date;
      status: string;
    }>('contact_messages');

  return {
    async save(data: ContactFields): Promise<string> {
      const id = randomUUID();

      await messages.insertOne({
        _id: id,
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        created_at: new Date(),
        status: 'new',
      });

      return id;
    },

    async close(): Promise<void> {
      await client.close();
    },
  };
}