import axios from 'axios';

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getEmailWithToken(member_email: string): Promise<string | null> {
  await delay(500); // give some time for email delivery

  const mailhog_auth = { Authorization: "Basic dGVzdDp0ZXN0" }; // test:test

  const messageSearch = await axios.get("http://localhost:8025/api/v2/search", {
    params: {
      kind: "to",
      query: member_email,
    },
    headers: mailhog_auth,
  });

  const items = messageSearch.data.items;
  if (!items || items.length === 0) {
    throw new Error(`No email found for ${member_email}`);
  }
  // Assuming the most recent email is the one we want
  const itemId = items[0].ID;
  console.log("ItemId ", itemId)
  const messageId = itemId;
const encodedId = encodeURIComponent(messageId);

const messageDetails = await axios.get(`http://localhost:8025/api/v2/messages/${encodedId}`,
 { headers:  mailhog_auth }
);

  const body = messageDetails.data.Content.Body;

  // Extract token from the body using regex (adapt to your actual token format)
  const match = body.match(/confirm\?token=([a-zA-Z0-9-_]+)/);

  if (match && match[1]) {
    return match[1];
  }

  throw new Error('Token not found in the email body.');
}
