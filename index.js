require('dotenv').config();
const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');

const log = (msg, type = "INFO") => {
    const color = type === "ERROR" ? "\x1b[31m" : "\x1b[32m";
    console.log(`${color}[${type}] ${msg}\x1b[0m`);
};

log("--- INITIALIZING ARCHITECT ENGINE ---");

if (!process.env.TELEGRAM_TOKEN) {
    log("FATAL: TELEGRAM_TOKEN missing in .env", "ERROR");
    process.exit(1);
}

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
bot.commands = new Map();

// --- PLUGIN ENGINE ---
const loadPlugins = () => {
    const pluginPath = path.join(__dirname, 'plugins');
    if (!fs.existsSync(pluginPath)) fs.mkdirSync(pluginPath);
    const files = fs.readdirSync(pluginPath).filter(f => f.endsWith('.js'));
    
    files.forEach(file => {
        try {
            const cmd = require(path.join(pluginPath, file));
            bot.command(cmd.name, (ctx) => cmd.run(ctx, {}, bot));
            bot.commands.set(cmd.name, cmd);
            log(`[MODULE] Loaded: ${cmd.name.toUpperCase()}`);
        } catch (e) { log(`[MODULE] Failed ${file}: ${e.message}`, "ERROR"); }
    });
    return bot.commands.size;
};

// --- STARTUP LOGIC ---
async function startBot() {
    try {
        log("Attempting to connect to Telegram...");
        
        // This line fetches the bot's actual name from the API
        const botInfo = await bot.telegram.getMe();
        log(`CONNECTED AS: @${botInfo.username} (${botInfo.first_name})`);

        const count = loadPlugins();
        log(`SYNC COMPLETE: ${count} plugins ready.`);

        await bot.launch();
        log("POLLING STARTED: ARCHITECT IS LIVE.");

        // TEST DM TO OWNER
        if (process.env.OWNER_ID) {
            log(`Sending boot alert to Owner ID: ${process.env.OWNER_ID}`);
            await bot.telegram.sendMessage(process.env.OWNER_ID, 
                `🛰️ <b>NODE ONLINE</b>\nBot: @${botInfo.username}\nStatus: Ready for deployment.`, 
                { parse_mode: 'HTML' }
            ).catch(e => log(`DM Failed: ${e.message}. Did you start the bot in private?`, "ERROR"));
        }

    } catch (err) {
        log(`CONNECTION FATAL: ${err.message}`, "ERROR");
    }
}

startBot();
