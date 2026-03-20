require('dotenv').config();
const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');

const log = (msg, type = "INFO") => {
    const color = type === "ERROR" ? "\x1b[31m" : "\x1b[32m";
    console.log(`${color}[${type}] ${msg}\x1b[0m`);
};

if (!process.env.TELEGRAM_TOKEN) {
    log("FATAL: TELEGRAM_TOKEN missing", "ERROR");
    process.exit(1);
}

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;
const PREFIX = process.env.PREFIX || ".";
bot.commands = new Map();

// --- DATABASE ---
const dbPath = path.join(__dirname, 'database.json');
let database = { users: {}, channels: {} };
if (fs.existsSync(dbPath)) {
    try { database = JSON.parse(fs.readFileSync(dbPath, 'utf8')); } catch (e) { log("DB Load Error", "ERROR"); }
}
const saveDatabase = () => fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));

// --- PLUGIN LOADER ---
const loadPlugins = () => {
    const pluginPath = path.join(__dirname, 'plugins');
    if (!fs.existsSync(pluginPath)) fs.mkdirSync(pluginPath);
    const files = fs.readdirSync(pluginPath).filter(f => f.endsWith('.js'));
    files.forEach(file => {
        try {
            const cmd = require(path.join(pluginPath, file));
            const handle = (ctx) => cmd.run(ctx, database, bot);
            bot.command(cmd.name, handle);
            bot.hears(new RegExp(`^\\${PREFIX}${cmd.name}\\b`, 'i'), handle);
            if (cmd.aliases) {
                cmd.aliases.forEach(a => {
                    bot.command(a, handle);
                    bot.hears(new RegExp(`^\\${PREFIX}${a}\\b`, 'i'), handle);
                });
            }
            bot.commands.set(cmd.name, cmd);
            log(`[MODULE] Loaded: ${cmd.name.toUpperCase()}`);
        } catch (e) { log(`[MODULE] Failed ${file}: ${e.message}`, "ERROR"); }
    });
    return bot.commands.size;
};

// --- DYNAMIC WELCOME ENGINE (Topic 59) ---
bot.on('new_chat_members', async (ctx) => {
    const welcomeGroupId = process.env.WELCOME_GROUP_ID;
    const welcomeTopicId = process.env.WELCOME_TOPIC_ID;

    // Check if the arrival is in our target group
    if (ctx.chat.id.toString() === welcomeGroupId) {
        for (const user of ctx.message.new_chat_members) {
            if (user.is_bot) continue;

            // Generate a dynamic welcome with an embedded profile link for the photo
            const welcomeText = 
                `🦅 <b>ACCESS GRANTED</b>\n` +
                `━━━━━━━━━━━━━━\n` +
                `👤 <b>Operative:</b> <a href="tg://user?id=${user.id}">${user.first_name}</a>\n` +
                `🆔 <b>UID:</b> <code>${user.id}</code>\n` +
                `🛰️ <b>Node:</b> <code>Bamako_223</code>\n` +
                `🛠️ <b>Creator:</b> <a href="https://github.com/MFOF7310">Moussa Fofana</a>\n\n` +
                `Welcome to the Eagle Community. Stay sharp.`;

            await ctx.telegram.sendMessage(welcomeGroupId, welcomeText, {
                parse_mode: 'HTML',
                message_thread_id: welcomeTopicId || null,
                disable_web_page_preview: false // Set to false to allow GitHub preview if you want
            }).catch(e => log("Welcome Error: " + e.message, "ERROR"));
        }
    }
});

// --- MAIN MESSAGE HANDLER ---
bot.on('message', async (ctx, next) => {
    if (!ctx.message || !ctx.from || ctx.from.is_bot) return;

    const chatId = ctx.chat.id.toString();
    const userId = ctx.from.id.toString();
    const text = ctx.message.text || "";

    if (!database.channels) database.channels = {};
    if (!database.channels[chatId]) database.channels[chatId] = { lydia: false };
    if (!database.users[userId]) database.users[userId] = { name: ctx.from.first_name, xp: 0 };

    database.users[userId].xp += 1;
    saveDatabase();

    const isLydia = database.channels[chatId].lydia;
    const isMention = text.includes(`@${ctx.botInfo.username}`);
    const isReply = ctx.message.reply_to_message?.from?.id === ctx.botInfo.id;

    if (isLydia && (isMention || isReply || ctx.chat.type === 'private')) {
        if (!text.startsWith(PREFIX) && !text.startsWith('/')) { 
            if (!groq) return ctx.reply("📡 AI Engine Offline: Add GROQ_API_KEY to .env");
            
            await ctx.sendChatAction('typing');
            try {
                const completion = await groq.chat.completions.create({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: `You are ARCHITECT CG-223, a tactical AI for Eagle Community. Your creator is Moussa Fofana (https://github.com/MFOF7310). Location: Bamako, Mali. Be elite.` },
                        { role: 'user', content: text }
                    ],
                });
                ctx.reply(completion.choices[0].message.content, { reply_to_message_id: ctx.message.message_id });
            } catch (e) { log("Groq Error: " + e.message, "ERROR"); }
        }
    }
    return next();
});

async function start() {
    try {
        const botInfo = await bot.telegram.getMe();
        log(`CONNECTED AS: @${botInfo.username}`);
        const count = loadPlugins();
        
        if (process.env.OWNER_ID) {
            const bootMsg = `🦅 <b>ARCHITECT CG-223 // ONLINE</b>\n` +
                          `━━━━━━━━━━━━━━━━━━\n` +
                          `🛰️ <b>Node:</b> Bamako_223\n` +
                          `🛠️ <b>Creator:</b> <a href="https://github.com/MFOF7310">Moussa Fofana</a>\n` +
                          `📦 <b>Modules:</b> ${count} Synchronized`;
            await bot.telegram.sendMessage(process.env.OWNER_ID, bootMsg, { parse_mode: 'HTML' });
        }
        
        await bot.launch();
        log("POLLING STARTED");
    } catch (e) { log("FATAL: " + e.message, "ERROR"); }
}
start();
