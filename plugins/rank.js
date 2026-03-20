module.exports = {
    name: 'rank',
    aliases: ['level', 'xp'],
    category: 'PROFILE',
    run: async (ctx, database) => {
        const target = ctx.message.reply_to_message?.from || ctx.from;
        const userData = database[target.id] || { xp: 0, level: 1 };
        
        const xp = userData.xp || 0;
        const level = userData.level || 1;
        const nextLevelXP = level * 1000;
        const progress = Math.floor((xp % 1000) / 10);
        const bar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));

        const rankMsg = `
📊 <b>AGENT RANK: ${target.first_name.toUpperCase()}</b>
━━━━━━━━━━━━━━━━━━
⚡ <b>LEVEL:</b> <code>${level}</code>
✨ <b>TOTAL XP:</b> <code>${xp.toLocaleString()}</code>
📈 <b>PROGRESS:</b> <code>${bar}</code> ${progress}%
━━━━━━━━━━━━━━━━━━
📍 <i>Bamako Node • Eagle Community</i>`;

        ctx.replyWithHTML(rankMsg);
    }
};
