const os = require('os');

module.exports = {
    name: 'dashboard',
    aliases: ['menu', 'sysinfo'],
    category: 'SYSTEM',
    run: async (ctx, database) => {
        try {
            const uptimeVal = process.uptime();
            const h = Math.floor(uptimeVal / 3600);
            const m = Math.floor((uptimeVal % 3600) / 60);
            const s = Math.floor(uptimeVal % 60);
            
            const usedRAM = Math.round(process.memoryUsage().rss / 1024 / 1024);
            const totalRAM = Math.round(os.totalmem() / 1024 / 1024);
            const cpuCores = os.cpus().length;
            const platform = `${os.type()} ${os.arch()}`; 
            
            const now = new Date();
            const time = now.toLocaleTimeString('en-GB', { timeZone: 'Africa/Bamako', hour12: false });

            let output = "<code>";
            output += "╭──────── ARCHITECT CG-223 ──────────\n";
            output += `│ 👤 USER     : ${ctx.from.first_name}\n`;
            output += `│ 🕒 TIME     : ${time}\n`;
            output += `│ 📍 NODE     : Bamako-223 🇲🇱\n`;
            output += `│ 🖥️ PLATFORM : ${platform}\n`;
            output += `│ 🧠 RAM      : ${usedRAM}MB / ${totalRAM}MB\n`;
            output += `│ ⚙️ CPU      : ${cpuCores} cores\n`;
            output += `│ ⏳ UPTIME   : ${h}h ${m}m ${s}s\n`;
            output += "╰───────────────────────────────────\n\n";

            // Note: Since we register commands to the bot directly in index.js, 
            // you can still use categories if you export them in your plugin files!
            output += "    « DIGITAL ENGINE SYNCED »\n";
            output += "</code>";

            await ctx.replyWithHTML(output);
        } catch (error) {
            console.error(error);
            ctx.reply('⚠️ Dashboard Engine Failure.');
        }
    }
};
