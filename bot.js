require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const token = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = parseInt(process.env.ADMIN_ID);

const bot = new TelegramBot(token, { polling: true });

const IMAGE_1 = path.join(__dirname, 'assets', '6032900914860985096.jpg');
const IMAGE_1_BLURRED = path.join(__dirname, 'assets', '6032900914860985096_blurred.jpg');
const IMAGE_2 = path.join(__dirname, 'assets', '6028290989019484829 (1).jpg');

const users = new Map();

async function createBlurredImage() {
  try {
    if (!fs.existsSync(IMAGE_1_BLURRED) && fs.existsSync(IMAGE_1)) {
      await sharp(IMAGE_1)
        .blur(15)
        .toFile(IMAGE_1_BLURRED);
      console.log('✅ Blurred image created successfully');
    }
  } catch (error) {
    console.error('Error creating blurred image:', error);
  }
}

const MOTIVATIONAL_MESSAGES = [
  "💎 It's mining time! Let's find your next hidden wallet!",
  "🚀 I can feel a big discovery coming… Start mining now!",
  "💰 Your next wallet could be worth $5,000 — don't miss it!",
  "🧠 Smart miners don't wait. Open Onix Ai and start now!",
  "🔥 The crypto market is hot! Let's search and strike gold!",
  "🪙 One more mining run could change your balance forever.",
  "💫 You were close last time… maybe today's your lucky hit!",
  "💼 Don't let those wallets hide! Fire up Onix Ai again.",
  "🌍 While others sleep, miners find fortune. Be one of them!",
  "⛏️ Mining paused? Let's dig again and find something big.",
  "💸 I'm missing our mining sessions 😢 Let's get rich again!",
  "🧩 Every block mined brings you closer to success.",
  "🌟 Your 5-dollar discovery last time was just the beginning!",
  "💎 Fortune favors those who mine. Ready to continue?",
  "🔔 The next wallet might be full of Bitcoin — don't skip it!",
  "🤑 You still have Credits waiting! Start mining again now.",
  "⚡ Energy levels: full. Wallets detected nearby 👀 Let's go!",
  "🪄 Magic happens when you press Onix Ai — tap it now!",
  "💼 We're one wallet away from a big find… Start mining.",
  "💰 Your future self will thank you for today's mining session."
];

function saveUser(userId, username, firstName) {
  if (!users.has(userId)) {
    users.set(userId, {
      id: userId,
      username: username || null,
      first_name: firstName || null,
      started_at: new Date(),
      last_active: new Date(),
      last_reminder_sent: null
    });
  } else {
    const user = users.get(userId);
    user.last_active = new Date();
    users.set(userId, user);
  }
}

function updateLastActive(userId) {
  if (users.has(userId)) {
    const user = users.get(userId);
    user.last_active = new Date();
    users.set(userId, user);
  }
}

function updateLastReminderSent(userId) {
  if (users.has(userId)) {
    const user = users.get(userId);
    user.last_reminder_sent = new Date();
    users.set(userId, user);
  }
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username;
  const firstName = msg.from.first_name;

  saveUser(userId, username, firstName);

  const welcomeText = `💎 Welcome to Onix Ai 💎
Your smart crypto mining companion.
Discover wallets, earn credits, and explore mining — all from your phone!

Tap START below to begin your journey 🚀`;

  const imageToSend = fs.existsSync(IMAGE_1_BLURRED) ? IMAGE_1_BLURRED : IMAGE_1;

  if (fs.existsSync(imageToSend)) {
    await bot.sendPhoto(chatId, imageToSend, {
      caption: welcomeText,
      reply_markup: {
        inline_keyboard: [
          [{ text: '▶️ START', callback_data: 'start_mining' }]
        ]
      }
    });
  } else {
    await bot.sendMessage(chatId, welcomeText, {
      reply_markup: {
        inline_keyboard: [
          [{ text: '▶️ START', callback_data: 'start_mining' }]
        ]
      }
    });
  }
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;

  updateLastActive(userId);

  if (data === 'start_mining') {
    const detailedText = `⚡ Welcome to Onix Ai! ⚡

Here's how it works 👇
1️⃣ Start mining and discover wallets.
2️⃣ Earn Credits with each search.
3️⃣ Upgrade anytime for unlimited mining power.

Let's get started and see what you can find today! 💎`;

    if (fs.existsSync(IMAGE_2)) {
      await bot.sendPhoto(chatId, IMAGE_2, {
        caption: detailedText,
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔹 Profit Channel', url: 'https://t.me/onix_ai_live_profits' }],
            [{ text: '🔹 Community Channel', url: 'https://t.me/onixaispace' }],
            [{ text: '💠 Open Onix Ai App', url: 'https://t.me/OnixAi1_bot?startapp' }]
          ]
        }
      });
    } else {
      await bot.sendMessage(chatId, detailedText, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔹 Profit Channel', url: 'https://t.me/onix_ai_live_profits' }],
            [{ text: '🔹 Community Channel', url: 'https://t.me/onixaispace' }],
            [{ text: '💠 Open Onix Ai App', url: 'https://t.me/OnixAi1_bot?startapp' }]
          ]
        }
      });
    }

    await bot.answerCallbackQuery(query.id);
  }
});

bot.onText(/\/admin/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (userId !== ADMIN_ID) {
    return bot.sendMessage(chatId, '❌ You are not authorized to use admin commands.');
  }

  const adminText = `🔐 Admin Panel

Choose an action:`;

  bot.sendMessage(chatId, adminText, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '📤 Send Message', callback_data: 'admin_send_message' }],
        [{ text: '📢 Send Advertisement', callback_data: 'admin_send_ad' }],
        [{ text: '🖼️ Send Image', callback_data: 'admin_send_image' }],
        [{ text: '📊 User Stats', callback_data: 'admin_stats' }]
      ]
    }
  });
});

const adminState = {};

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;

  if (userId !== ADMIN_ID) {
    return bot.answerCallbackQuery(query.id, { text: '❌ Unauthorized' });
  }

  if (data === 'admin_send_message') {
    adminState[userId] = { action: 'send_message' };
    await bot.sendMessage(chatId, '📝 Please send the message you want to broadcast to all users:');
    await bot.answerCallbackQuery(query.id);
  } else if (data === 'admin_send_ad') {
    adminState[userId] = { action: 'send_ad' };
    await bot.sendMessage(chatId, '📢 Please send the advertisement message:');
    await bot.answerCallbackQuery(query.id);
  } else if (data === 'admin_send_image') {
    adminState[userId] = { action: 'send_image' };
    await bot.sendMessage(chatId, '🖼️ Please send the image with caption (optional):');
    await bot.answerCallbackQuery(query.id);
  } else if (data === 'admin_stats') {
    const allUsers = Array.from(users.values());
    const totalUsers = allUsers.length;
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const activeToday = allUsers.filter(u => u.last_active > oneDayAgo).length;
    const activeThisWeek = allUsers.filter(u => u.last_active > oneWeekAgo).length;

    const statsText = `📊 Bot Statistics

👥 Total Users: ${totalUsers}
📅 Active Today: ${activeToday}
📆 Active This Week: ${activeThisWeek}`;

    await bot.sendMessage(chatId, statsText);
    await bot.answerCallbackQuery(query.id);
  }
});

bot.on('message', async (msg) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;

  if (userId === ADMIN_ID && adminState[userId]) {
    const action = adminState[userId].action;

    if (action === 'send_message' && msg.text && !msg.text.startsWith('/')) {
      const allUsers = Array.from(users.keys());
      let successCount = 0;
      let failCount = 0;

      for (const uid of allUsers) {
        try {
          await bot.sendMessage(uid, msg.text);
          successCount++;
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (err) {
          failCount++;
        }
      }

      await bot.sendMessage(chatId, `✅ Message sent!\n\n📤 Sent: ${successCount}\n❌ Failed: ${failCount}`);
      delete adminState[userId];
    } else if (action === 'send_ad' && msg.text && !msg.text.startsWith('/')) {
      const allUsers = Array.from(users.keys());
      let successCount = 0;
      let failCount = 0;

      for (const uid of allUsers) {
        try {
          await bot.sendMessage(uid, `📢 Advertisement\n\n${msg.text}`);
          successCount++;
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (err) {
          failCount++;
        }
      }

      await bot.sendMessage(chatId, `✅ Advertisement sent!\n\n📤 Sent: ${successCount}\n❌ Failed: ${failCount}`);
      delete adminState[userId];
    } else if (action === 'send_image' && msg.photo) {
      const allUsers = Array.from(users.keys());
      const photoId = msg.photo[msg.photo.length - 1].file_id;
      const caption = msg.caption || '';

      let successCount = 0;
      let failCount = 0;

      for (const uid of allUsers) {
        try {
          await bot.sendPhoto(uid, photoId, { caption });
          successCount++;
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (err) {
          failCount++;
        }
      }

      await bot.sendMessage(chatId, `✅ Image sent!\n\n📤 Sent: ${successCount}\n❌ Failed: ${failCount}`);
      delete adminState[userId];
    }
  }
});

function sendHourlyReminders() {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const allUsers = Array.from(users.values());
  const inactiveUsers = allUsers.filter(user => {
    const lastActive = user.last_active;
    const lastReminder = user.last_reminder_sent;

    return lastActive < oneHourAgo &&
           (!lastReminder || lastReminder < oneHourAgo);
  });

  if (inactiveUsers.length === 0) {
    console.log('No users to send reminders to.');
    return;
  }

  for (const user of inactiveUsers) {
    try {
      const randomMessage = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
      bot.sendMessage(user.id, randomMessage)
        .then(() => {
          updateLastReminderSent(user.id);
        })
        .catch(err => {
          console.error(`Failed to send reminder to user ${user.id}:`, err.message);
        });

      setTimeout(() => {}, 100);
    } catch (err) {
      console.error(`Error processing reminder for user ${user.id}:`, err.message);
    }
  }

  console.log(`Sent reminders to ${inactiveUsers.length} users.`);
}

cron.schedule('0 * * * *', () => {
  console.log('Running hourly reminder task...');
  sendHourlyReminders();
});

createBlurredImage().then(() => {
  console.log('✅ Onix AI Telegram Bot is running...');
  console.log(`👨‍💼 Admin ID: ${ADMIN_ID}`);
});
