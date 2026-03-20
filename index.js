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

// --- DATABASE SYNC ---
const dbPath = path.join(__dirname, 'database.json');
let database = { users: {}, channels: {} };
if (fs.existsSync(dbPath)) {
    try { database = JSON.parse(fs.readFileSync(dbPath, 'utf8')); } catch (e) { log("DB Load Error", "ERROR"); }
}
const saveDatabase = () => fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));

// --- PLUGIN LOADER (Dual Prefix Support) ---
const loadPlugins = () => {
    const pluginPath = path.join(__dirname, 'plugins');
    if (!fs.existsSync(pluginPath)) fs.mkdirSync(pluginPath);
    const files = fs.readdirSync(pluginPath).filter(f => f.endsWith('.js'));
    
    files.forEach(file => {
        try {
            const cmd = require(path.join(pluginPath, file));
            const handle = (ctx) => cmd.run(ctx, database, bot);
            
            // Register /command
            bot.command(cmd.name, handle);
            // Register .command
            bot.hears(new RegExp(`^\\${PREFIX}${cmd.name}\\b`, 'i'), handle);

            if (cmd.aliases) {
                cmd.aliases.forEach(a => {
                    bot.command(a, handle);
                    bot.hears(new RegExp(`^\\${PREFIX}${a}\\b`, 'i'), handle);
                });
            }
            log(`[MODULE] Loaded: ${cmd.name.toUpperCase()}`);
        } catch (e) { log(`[MODULE] Failed ${file}: ${e.message}`, "ERROR"); }
    });
    return files.length;
};

// --- MESSAGE HANDLER (XP & AI) ---
bot.on('message', async (ctx, next) => {
    if (!ctx.message || !ctx.from || ctx.from.is_bot) return;

    const chatId = ctx.chat.id.toString();
    const userId = ctx.from.id.toString();
    const text = ctx.message.text || "";

    // Init DB structures
    if (!database.channels) database.channels = {};
    if (!database.channels[chatId]) database.channels[chatId] = { lydia: false };
    if (!database.users[userId]) database.users[userId] = { name: ctx.from.first_name, xp: 0 };

    database.users[userId].xp += 1;
    saveDatabase();

    // AI Check
    const isLydia = database.channels[chatId].lydia;
    const isMention = text.includes(`@${ctx.botInfo.username}`);
    const isReply = ctx.message.reply_to_message?.from?.id === ctx.botInfo.id;

    if (isLydia && (isMention || isReply || ctx.chat.type === 'private')) {
        if (!text.startsWith(PREFIX)) { // Don't trigger AI on commands
            if (!groq) return ctx.reply("📡 AI Engine Offline: Missing GROQ_API_KEY.");
            
            await ctx.sendChatAction('typing');
            try {
                const completion = await groq.chat.completions.create({
                    model: 'llama-3.3-70b-versatile',
                    messages: [{ role: 'system', content: 'You are ARCHITECT CG-223, a tactical AI.' }, { role: 'user', content: text }],
                });
                ctx.reply(completion.choices[0].message.content, { reply_to_message_id: ctx.message.message_id });
            } catch (e) { log("Groq Error: " + e.message, "ERROR"); }
        }
    }
    return next();
});

// --- IGNITION ---
async function start() {
    try {
        const botInfo = await bot.telegram.getMe();
        log(`CONNECTED AS: @${botInfo.username}`);
        loadPlugins();
        
        if (process.env.OWNER_ID) {
            await bot.telegram.sendMessage(process.env.OWNER_ID, `🛰️ <b>NODE ONLINE</b>\nBot: @${botInfo.username}`, { parse_mode: 'HTML' });
        }
        
        await bot.launch();
        log("POLLING STARTED");
    } catch (e) { log("FATAL ERROR: " + e.message, "ERROR"); }
}

start();
