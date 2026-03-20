module.exports = {
    name: 'alive',
    aliases: ['status', 'ping', 'uptime'],
    run: async (ctx) => {
        const uptimeVal = process.uptime();
        const h = Math.floor(uptimeVal / 3600);
        const m = Math.floor((uptimeVal % 3600) / 60);
        const s = Math.floor(uptimeVal % 60);
        
        // Telegram latency is calculated from the message date
        const msgLatency = Date.now() - (ctx.message.date * 1000);
        const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

        const statusReport = `
<code>╭───────── SYSTEM STATUS ──────────
│ 🟢 STATE   : ACTIVE / ONLINE
│ ⚡ ENGINE  : ARCHITECT-CG-223
│ 📍 NODE    : BAMAKO-ML 🇲🇱
│ 📡 LATENCY : ${msgLatency}ms
│ ⏳ UPTIME  : ${h}h ${m}m ${s}s
│ 💾 MEMORY  : ${memoryUsage} MB
╰──────────────────────────────────</code>
<b>« DIGITAL ENGINE SYNCED »</b>`;

        await ctx.replyWithHTML(statusReport);
    }
};
