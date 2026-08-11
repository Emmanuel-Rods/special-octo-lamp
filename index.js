const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PWN_ID = process.env.PWN_ID;

async function getChatIds() {
  const url = `https://api.telegram.org/bot${TOKEN}/getupdates`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error("Something Went Wrong While Getting Telegram Updates");
    }

    const uniqueChatIds = [
      ...new Set(data.result.map((update) => update.message.chat.id)),
    ];

    return uniqueChatIds;
  } catch (error) {
    console.log("Error In getChatIds", error);
  }
}

async function sendMessage(uniqueChatIds, data) {
  const verdict = formater(data);
  for (const chatId of uniqueChatIds) {
    const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

    const payload = {
      chat_id: chatId,
      text: verdict,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.ok) {
        console.log(`Message sent successfully to chat ID: ${chatId}`);
      } else {
        console.log(`Failed to send to ${chatId}:`, data.description);
      }
    } catch (error) {
      console.error(`Error sending to ${chatId}:`, error);
    }
  }
}

async function getPWNActivity() {
  const url = `https://pwn.college/pwncollege_api/v1/activity/${PWN_ID}`; //

  try {
    const response = await fetch(url);

    // Check if the request was successful (status code 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the response as JSON (use response.text() if it's plain text/HTML)
    const data = await response.json();

    console.log("Success:", data);

    return data;
  } catch (error) {
    console.error("Failed to fetch data:", error);
  }
}

function formater(data) {
  const isoString = data.data.solve_timestamps[0];
  const date = new Date(isoString);

  const readableDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long", // 'short' for Aug, 'numeric' for 8
    day: "numeric",
  });

  return `Roger has ${data.data.total_solves} total solves\nLast Solve on ${readableDate}`;
}

async function main() {
  try {
    const ids = await getChatIds();
    const activity = await getPWNActivity();
    await sendMessage(ids, activity);
  } catch (error) {
    console.error(error);
  }
}

main();
