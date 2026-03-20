module.exports = {
    name: 'list',
    category: 'SYSTEM',
    run: async (ctx) => {
        const prefix = process.env.PREFIX || '.';
        
        // In Telegram, we can't easily read the full command object 
        // from the ctx, so it's best to keep a manual list or 
        // reference a global command map if you set one up in index.js.
        
        const helpMsg = `
📋 <b>AVAILABLE MODULES</b>
━━━━━━━━━━━━━━━━━━
<b>SYSTEM:</b>
• <code>${prefix}dashboard</code> – System overview
• <code>${prefix}alive</code> – Check status
• <code>${prefix}list</code> – Command index

<b>MODERATION:</b>
• <code>${prefix}ban</code> – Permanent exclusion
• <code>${prefix}kick</code> – Temporary disconnect
• <code>${prefix}clear</code> – Sector sanitization

🎮 <b>Tip:</b> Mention me for AI assistance!
━━━━━━━━━━━━━━━━━━
<i>Eagle Community | Digital Engine</i>`;

        await ctx.replyWithHTML(helpMsg);
    }
};
