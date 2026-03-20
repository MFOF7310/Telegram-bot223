module.exports = {
    name: 'lydia',
    aliases: ['ai'],
    run: async (ctx, database) => {
        const chatId = ctx.chat.id.toString();
        if (!database.channels[chatId]) database.channels[chatId] = { lydia: false };

        const isAdmin = ctx.chat.type === 'private' || (await ctx.getChatAdministrators().catch(() => [])).some(acc => acc.user.id === ctx.from.id);
        if (!isAdmin && ctx.from.id.toString() !== process.env.OWNER_ID) return ctx.reply("⛔ Unauthorized.");

        const sub = ctx.message.text.split(' ')[1]?.toLowerCase();
        if (sub === 'on') {
            database.channels[chatId].lydia = true;
            ctx.replyWithHTML("✅ <b>LYDIA ACTIVE</b>\nNeural link established in this sector.");
        } else if (sub === 'off') {
            database.channels[chatId].lydia = false;
            ctx.replyWithHTML("❌ <b>LYDIA OFFLINE</b>\nNeural link severed.");
        } else {
            ctx.reply(`Usage: ${process.env.PREFIX}lydia on/off`);
        }
    }
};
