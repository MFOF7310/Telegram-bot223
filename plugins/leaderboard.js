module.exports = {
    name: 'leaderboard',
    aliases: ['lb', 'top'],
    category: 'SYSTEM',
    run: async (ctx, database) => {
        const entries = Object.entries(database)
            .map(([id, data]) => ({ name: data.name, xp: data.xp, level: data.level }))
            .sort((a, b) => b.xp - a.xp)
            .slice(0, 10);

        if (!entries.length) return ctx.reply("📊 Database Offline.");

        let lbMsg = "🏆 <b>TOP-TIER AGENTS</b>\n━━━━━━━━━━━━━━━━━━\n";
        const medals = ['🥇', '🥈', '🥉'];

        entries.forEach((user, i) => {
            const rank = i < 3 ? medals[i] : `<b>#${i + 1}</b>`;
            lbMsg += `${rank} <b>${user.name}</b>\n╰ ✨ XP <code>${user.xp.toLocaleString()}</code> • ⚡ Lvl <code>${user.level}</code>\n`;
        });

        lbMsg += "━━━━━━━━━━━━━━━━━━\n<i>Bamako-223 Node | total Agents: " + Object.keys(database).length + "</i>";
        await ctx.replyWithHTML(lbMsg);
    }
};
