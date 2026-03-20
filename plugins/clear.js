module.exports = {
    name: 'clear',
    aliases: ['purge', 'clean', 'delete'],
    run: async (ctx) => {
        // Permission Check
        const isAdmin = ctx.chat.type === 'private' || 
            (await ctx.getChatAdministrators().catch(() => [])).some(acc => acc.user.id === ctx.from.id);
        
        if (!isAdmin && ctx.from.id.toString() !== process.env.OWNER_ID) {
            return ctx.reply("⛔ Admin clearance required.");
        }

        const args = ctx.message.text.split(' ');
        let amount = parseInt(args[1]);

        if (isNaN(amount) || amount <= 0) amount = 1;
        if (amount > 100) amount = 100; // Telegram limit is 100 for batch deletes

        // 1. Delete the command itself
        await ctx.deleteMessage().catch(() => {});

        const startId = ctx.message.message_id;
        let deletedCount = 0;

        // 2. The Force-Purge Loop
        // We go back through the last 200 IDs to find the 'amount' requested
        // because service messages and other bots often skip ID numbers.
        for (let i = 0; i < amount + 10 && deletedCount < amount; i++) {
            const targetId = startId - i;
            try {
                await ctx.telegram.deleteMessage(ctx.chat.id, targetId);
                deletedCount++;
            } catch (e) {
                // We don't log errors here so the console stays clean 
                // when it tries to delete IDs that don't exist.
            }
        }

        const status = await ctx.replyWithHTML(`🧹 <b>PURGE COMPLETE</b>\n<code>${deletedCount}</code> signals (including bot logs) cleared.`);
        setTimeout(() => ctx.deleteMessage(status.message_id).catch(() => {}), 3000);
    }
};
