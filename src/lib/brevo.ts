import {
  ContactsApi,
  ContactsApiApiKeys,
  CreateContact,
} from '@getbrevo/brevo';

let brevoContactsInstance: ContactsApi | null = null;

function getBrevoContactsClient() {
  if (!brevoContactsInstance) {
    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY is not configured');
    }
    brevoContactsInstance = new ContactsApi();
    brevoContactsInstance.setApiKey(
      ContactsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY,
    );
  }
  return brevoContactsInstance;
}

function getNewsletterListId(): number | null {
  const listId = process.env.BREVO_NEWSLETTER_LIST_ID;
  if (!listId) {
    return null;
  }
  const parsed = Number(listId);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function addBrevoNewsletterContact(
  email: string,
  source?: string,
): Promise<{ ok: boolean; reason?: string }> {
  const listId = getNewsletterListId();
  if (!listId) {
    return { ok: false, reason: 'BREVO_NEWSLETTER_LIST_ID not configured' };
  }

  const client = getBrevoContactsClient();

  const contact = new CreateContact();
  contact.email = email.toLowerCase();
  contact.listIds = [listId];
  contact.updateEnabled = true;

  if (source) {
    contact.attributes = { SOURCE: source };
  }

  await client.createContact(contact);
  return { ok: true };
}
