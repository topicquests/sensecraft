import axios from 'axios';
import { decode } from 'libqp';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getEmailWithToken(this: any, member_email: string) {
  await delay(500); // give some time for email delivery

  const mailhog_auth = { Authorization: 'Basic dGVzdDp0ZXN0' }; // test:test

  const messageSearch = await axios.get('http://localhost:8025/api/v2/search', {
    params: {
      kind: 'to',
      query: member_email,
    },
    headers: mailhog_auth,
  });
  const email = messageSearch.data.items[0];
  const textParts = email.MIME.Parts.filter(
    (x) =>
      ((x.Headers || {})['Content-Type'] || [''])[0].indexOf('text/plain') >= 0,
  );
  let text: string = textParts[0].Body;
  if (textParts[0].Headers['Content-Transfer-Encoding'] == 'quoted-printable')
    text = decode(text).toString();
  const token_search = /(http:.*)/.exec(text);
  const token = token_search![1];
  return token;
}
