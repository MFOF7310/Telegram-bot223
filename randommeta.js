module.exports = {
    name: 'randommeta',
    aliases: ['meta'],
    category: 'GAMING',
    run: async (ctx) => {
        const meta = [
            { 
                name: "BP50", 
                intel: "🔥 <b>Tier: GOD</b> | Highest fire rate in-game. Dominates close-to-mid range.", 
                url: "https://t.me/your_chat/1" // <--- Paste your Telegram image link here
            },
            { 
                name: "SKS", 
                intel: "🏹 <b>Tier: S</b> | High skill ceiling. Lethal two-tap potential for marksmen.", 
                url: "https://t.me/your_chat/2" // <--- Paste your Telegram image link here
            }
        ];

        const pick = meta[Math.floor(Math.random() * meta.length)];
        
        const caption = `
🎲 <b>META RECOMMENDATION: ${pick.name}</b>
━━━━━━━━━━━━━━━━━━
${pick.intel}
━━━━━━━━━━━━━━━━━━
<i>Eagle Community | Mobile Node</i>`;

        await ctx.replyWithPhoto(pick.url, { caption, parse_mode: 'HTML' });
    }
};
