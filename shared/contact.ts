export interface ContactFields {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
}

export type ContactFieldErrors = Partial<Record<keyof ContactFields, string>>;
export type ContactFormState = 'idle' | 'sending' | 'success' | 'error';

export interface ContactResponse {
  id?: string;
  message?: string;
  error?: string;
  fields?: ContactFieldErrors;
}
