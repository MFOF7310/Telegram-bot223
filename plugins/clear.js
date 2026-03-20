module.exports = {
    name: 'clear',
    aliases: ['clean', 'purge'],
    run: async (ctx) => {
        const isAdmin = ctx.chat.type === 'private' || (await ctx.getChatAdministrators().catch(() => [])).some(acc => acc.user.id === ctx.from.id);
        if (!isAdmin) return ctx.reply("⛔ Admin clearance required to purge data.");

        const args = ctx.message.text.split(' ');
        const amount = parseInt(args[1]);

        if (isNaN(amount) || amount <= 0 || amount > 100) {
            return ctx.reply("⚠️ Specify a purge amount between 1 and 100.");
        }

        const messageId = ctx.message.message_id;
        
        // Deletes the command message first
        await ctx.deleteMessage().catch(() => {});

        for (let i = 0; i < amount; i++) {
            try {
                // Attempts to delete messages backwards from the command location
                await ctx.deleteMessage(messageId - i - 1);
            } catch (e) {
                // Stops if it hits messages older than 48 hours
                break; 
            }
        }

        const confirm = await ctx.reply(`🧹 <b>Purge Complete:</b> ${amount} signals cleared.`, { parse_mode: 'HTML' });
        setTimeout(() => ctx.deleteMessage(confirm.message_id).catch(() => {}), 3000);
    }
};
