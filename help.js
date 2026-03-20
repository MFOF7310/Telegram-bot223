module.exports = {
    name: 'help',
    aliases: ['h', 'commands'],
    category: 'SYSTEM',
    run: async (ctx, database, bot) => {
        const args = ctx.message.text.split(' ');
        
        // --- 1. DETAIL MODE (.help <command>) ---
        if (args[1]) {
            const query = args[1].toLowerCase();
            const cmd = bot.commands.get(query) || [...bot.commands.values()].find(c => c.aliases && c.aliases.includes(query));

            if (!cmd) return ctx.replyWithHTML(`❌ <b>Error:</b> Command <code>${query}</code> not found.`);

            return ctx.replyWithHTML(`
🔍 <b>COMMAND INTEL: ${cmd.name.toUpperCase()}</b>
━━━━━━━━━━━━━━━━━━
📑 <b>Category:</b> ${cmd.category || 'GENERAL'}
🔗 <b>Aliases:</b> ${cmd.aliases ? cmd.aliases.join(', ') : 'None'}
📝 <b>Description:</b> ${cmd.description || 'No data provided.'}
━━━━━━━━━━━━━━━━━━`);
        }

        // --- 2. GLOBAL LIST MODE (.help) ---
        // Organizes commands by category automatically
        const categories = {};
        bot.commands.forEach(cmd => {
            const cat = cmd.category || 'UNCATEGORIZED';
            if (!categories[cat]) categories[cat] = [];
            categories[cat].push(`<code>${cmd.name}</code>`);
        });

        let helpMsg = `<b>🛰️ ARCHITECT CG-223 | CONTROL INTERFACE</b>\n━━━━━━━━━━━━━━━━━━\n`;
        
        for (const [category, cmds] of Object.entries(categories)) {
            helpMsg += `\n📦 <b>${category}:</b>\n${cmds.join(', ')}\n`;
        }

        helpMsg += `\n━━━━━━━━━━━━━━━━━━\n💬 <b>AI:</b> Reply or tag me to chat.\n<i>Protocol Eagle • Bamako Node</i>`;

        await ctx.replyWithHTML(helpMsg);
    }
};
