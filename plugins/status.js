const os = require('os');
const { performance } = require('perf_hooks');

module.exports = {
    name: 'status',
    aliases: ['stats', 'ping', 'health'],
    category: 'SYSTEM',
    description: 'Displays real-time node health and module synchronization.',
    run: async (ctx, database, bot) => {
        const start = performance.now();
        const msg = await ctx.reply("📡 <i>Pinging Bamako Node...</i>", { parse_mode: "HTML" });
        const end = performance.now();
        const ping = Math.round(end - start);

        // Uptime Calculation
        const uptimeSeconds = process.uptime();
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);

        // Stats from Database
        const userCount = Object.keys(database.users || {}).length;
        const activeLydiaChannels = Object.values(database.channels || {}).filter(c => c.lydia).length;

        const healthReport = `
<b>🛰️ ARCHITECT CG-223 | NODE HEALTH</b>
━━━━━━━━━━━━━━━━━━
📡 <b>LATENCY:</b> <code>${ping}ms</code>
🕒 <b>UPTIME:</b> <code>${hours}h ${minutes}m</code>
📦 <b>MODULES:</b> <code>${bot.commands.size} Active</code>
👥 <b>OPERATIVES:</b> <code>${userCount} Synced</code>
🧠 <b>LYDIA NODES:</b> <code>${activeLydiaChannels} Active</code>
━━━━━━━━━━━━━━━━━━
🔋 <b>MEMORY:</b> <code>${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB</code>
📑 <b>VERSION:</b> <code>2.6.1-STABLE</code>
━━━━━━━━━━━━━━━━━━
📍 <i>NODE: BAMAKO_223</i>`;

        await ctx.telegram.editMessageText(ctx.chat.id, msg.message_id, null, healthReport, { parse_mode: 'HTML' });
    }
};
