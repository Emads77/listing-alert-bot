const TOKEN = process.env.TG_TOKEN;
const CHAT_ID = process.env.TG_CHAT;

export async function notify(text) {
  try {
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, disable_web_page_preview: false })
    });
  } catch (err) {
    console.error(`[notify] ${err.message}`);
  }
}