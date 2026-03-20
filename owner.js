module.exports = {
    name: 'owner',
    category: 'OWNER',
    run: async (ctx) => {
        // Security Check
        if (ctx.from.id.toString() !== process.env.OWNER_ID) return;

        const response = `
🛰️ <b>ARCHITECT CG-223 | EXECUTIVE HUB</b>
━━━━━━━━━━━━━━━━━━
🔗 <b>Facebook:</b> <a href="https://www.facebook.com/share/17KysmJrtm/">Cloud Gaming</a>
📱 <b>TikTok:</b> <a href="https://www.tiktok.com/@cloudgaming223">@cloudgaming223</a>
📸 <b>Instagram:</b> <a href="https://www.instagram.com/mfof7310">@mfof7310</a>
💬 <b>Discord:</b> <a href="https://discord.gg/NFSMFJajp9">Eagle Community</a>
━━━━━━━━━━━━━━━━━━
📍 <i>NODE: BAMAKO_223</i>`;

        await ctx.replyWithHTML(response, { disable_web_page_preview: false });
    }
};
