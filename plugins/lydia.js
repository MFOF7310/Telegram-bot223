module.exports = {
    name: 'lydia',
    aliases: ['ai', 'aimode'],
    category: 'SYSTEM',
    run: async (ctx, database) => {
        const chatId = ctx.chat.id.toString();
        
        // Ensure database paths exist
        if (!database.channels) database.channels = {};
        if (!database.channels[chatId]) database.channels[chatId] = { lydia: false };

        // Permission check
        const isAdmin = ctx.chat.type === 'private' || 
            (await ctx.getChatAdministrators().catch(() => [])).some(acc => acc.user.id === ctx.from.id);
        const isOwner = ctx.from.id.toString() === process.env.OWNER_ID;

        if (!isAdmin && !isOwner) return ctx.reply("⛔ Admin clearance required.");

        const args = ctx.message.text.split(' ');
        const sub = args[1]?.toLowerCase();

        if (sub === 'on') {
            database.channels[chatId].lydia = true;
            ctx.replyWithHTML("✅ <b>LYDIA ACTIVATED</b>\nEngine is now listening for mentions/replies.");
        } else if (sub === 'off') {
            database.channels[chatId].lydia = false;
            ctx.replyWithHTML("❌ <b>LYDIA DEACTIVATED</b>\nEngine moved to standby.");
        } else {
            const status = database.channels[chatId].lydia ? "ACTIVE" : "OFFLINE";
            ctx.replyWithHTML(`⚙️ <b>LYDIA STATUS:</b> <code>${status}</code>\nUsage: <code>.lydia on/off</code>`);
        }
    }
};
