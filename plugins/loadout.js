module.exports = {
    name: 'loadout',
    aliases: ['build'],
    category: 'GAMING',
    run: async (ctx) => {
        const args = ctx.message.text.split(' ');
        const weapon = args[1]?.toLowerCase();
        
        // --- DATA HUB (Paste your Telegram Image Links here) ---
        const loadouts = {
            "ak117": { 
                title: "AK117 - TACTICAL", 
                build: "OWC Marksman, No Stock, OWC Laser, 40 Rnd",
                url: "https://t.me/your_link_here_1" // Paste the link you copied from Telegram
            },
            "dlq33": { 
                title: "DL Q33 - PRECISION", 
                build: "MIP Light, Combat Stock, OWC Laser, FMJ",
                url: "https://t.me/your_link_here_2"
            }
        };

        const data = loadouts[weapon];
        if (!data) return ctx.reply("⚠️ Weapon intel not found in the mobile archive.");

        const caption = `
🔫 <b>${data.title}</b>
━━━━━━━━━━━━━━━━━━
🛠️ <b>BUILD:</b> <code>${data.build}</code>
━━━━━━━━━━━━━━━━━━
<i>Eagle Community | Mobile Node</i>`;

        // Telegram will automatically fetch and display the image from the link
        await ctx.replyWithPhoto(data.url, { caption, parse_mode: 'HTML' });
    }
};
