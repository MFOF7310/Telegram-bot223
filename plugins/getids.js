const { Telegraf } = require('telegraf');
require('dotenv').config();

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

// This will show you all IDs when someone messages
bot.on('message', (ctx) => {
    const info = `
📌 <b>CHAT INFORMATION</b>
━━━━━━━━━━━━━━━━
🆔 <b>Chat ID:</b> <code>${ctx.chat.id}</code>
📝 <b>Chat Type:</b> ${ctx.chat.type}
📛 <b>Chat Title:</b> ${ctx.chat.title || 'Private'}
👤 <b>User ID:</b> <code>${ctx.from.id}</code>
📋 <b>Message ID:</b> <code>${ctx.message.message_id}</code>
    `;
    
    ctx.reply(info, { parse_mode: 'HTML' });
    
    // Also log to console
    console.log('Full Chat Object:', JSON.stringify(ctx.chat, null, 2));
});

bot.launch();
console.log('Bot started - Send a message to any chat to get its ID');