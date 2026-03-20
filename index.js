require('dotenv').config();
const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');

// --- TERMINAL STYLING ---
const green = "\x1b[32m", cyan = "\x1b[36m", yellow = "\x1b[33m", reset = "\x1b[0m", bold = "\x1b[1m";

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const PREFIX = process.env.PREFIX || ".";

bot.commands = new Map();

// --- DATABASE PERSISTENCE ---
const dbPath = path.join(__dirname, 'database.json');
let database = JSON.parse(fs.existsSync(dbPath) ? fs.readFileSync(dbPath, 'utf8') : '{"users":{},"channels":{}}');
const saveDatabase = () => fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));

// --- PLUGIN LOADER ---
const loadPlugins = async () => {
    const pluginPath = path.join(__dirname, 'plugins');
    if (!fs.existsSync(pluginPath)) fs.mkdirSync(pluginPath);

    const files = fs.readdirSync(pluginPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
        try {
            const cmd = require(path.join(pluginPath, file));
            if (cmd.name && cmd.run) {
                bot.command(cmd.name, (ctx) => cmd.run(ctx, database, bot));
                if (cmd.aliases) cmd.aliases.forEach(a => bot.command(a, (ctx) => cmd.run(ctx, database, bot)));
                bot.commands.set(cmd.name, cmd);
                console.log(`${green}[SUCCESS]${reset} Linked Module: ${cyan}${cmd.name.toUpperCase()}${reset}`);
            }
        } catch (e) { console.log(`${yellow}[ERROR]${reset} ${file}: ${e.message}`); }
    }
};

// --- CORE MESSAGE HANDLER ---
bot.on('message', async (ctx, next) => {
    if (!ctx.message || !ctx.from || ctx.from.is_bot) return next();

    const userId = ctx.from.id.toString();
    const chatId = ctx.chat.id.toString();
    const text = ctx.message.text || "";

    // 1. INITIALIZE DATA
    if (!database.users[userId]) database.users[userId] = { name: ctx.from.first_name, xp: 0, level: 1 };
    if (!database.channels[chatId]) database.channels[chatId] = { lydia: false };

    // 2. XP SYSTEM
    database.users[userId].xp += Math.floor(Math.random() * 5) + 1;
    saveDatabase();

    // 3. COMMAND BYPASS
    if (text.startsWith(PREFIX)) return next();

    // 4. LYDIA AI LOGIC (DM, Mention, or Reply)
    const isPrivate = ctx.chat.type === 'private';
    const isLydiaEnabled = database.channels[chatId].lydia || false;
    const isMentioned = text.includes(`@${ctx.botInfo.username}`);
    const isReplyToBot = ctx.message.reply_to_message?.from?.id === ctx.botInfo.id;

    if (isPrivate || (isLydiaEnabled && (isMentioned || isReplyToBot))) {
        const cleanInput = text.replace(new RegExp(`@${ctx.botInfo.username}`, 'g'), '').trim();
        await ctx.sendChatAction('typing');
        
        try {
            const history = isReplyToBot ? [{ role: 'assistant', content: ctx.message.reply_to_message.text }] : [];
            const completion = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: "You are ARCHITECT CG-223, a tactical gaming AI for Eagle Community in Bamako. Be sharp, direct, and maintain context." },
                    ...history,
                    { role: 'user', content: cleanInput || "Status report." }
                ],
            });

            await ctx.reply(completion.choices[0].message.content, { reply_to_message_id: ctx.message.message_id });
        } catch (err) { console.error(`${yellow}[AI ERROR]${reset}`, err.message); }
    }
    return next();
});

// --- IGNITION ---
bot.launch().then(async () => {
    await loadPlugins();
    console.log(`\n${green}🛰️  CLIENT   : @${bot.botInfo.username}${reset}`);
    console.log(`${green}📍 NODE     : BAMAKO_223${reset}\n`);
    bot.telegram.sendMessage(process.env.OWNER_ID, "🦅 <b>ARCHITECT CG-223 // ONLINE</b>", { parse_mode: 'HTML' }).catch(() => null);
});
