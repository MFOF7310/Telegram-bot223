module.exports = {
    name: 'dlt',
    aliases: ['delete', 'remove'],
    category: 'UTILITY',
    run: async (ctx) => {
        const isAdmin = (await ctx.getChatAdministrators()).some(acc => acc.user.id === ctx.from.id);
        if (!isAdmin && ctx.from.id.toString() !== process.env.OWNER_ID) return;

        if (ctx.message.reply_to_message) {
            try {
                await ctx.deleteMessage(ctx.message.reply_to_message.message_id);
                await ctx.deleteMessage(ctx.message.message_id); // Delete the ".dlt" command too
                const success = await ctx.reply("🎯 <b>Target Packet Erased.</b>", { parse_mode: 'HTML' });
                setTimeout(() => ctx.deleteMessage(success.message_id).catch(() => null), 2000);
            } catch (e) {
                ctx.reply("⚠️ Message too old to erase.");
            }
        } else {
            ctx.reply("❓ <b>No target signature found.</b> (Reply to a message to delete it)");
        }
    }
};
