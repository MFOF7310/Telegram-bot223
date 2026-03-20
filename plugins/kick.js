module.exports = {
    name: 'kick',
    category: 'MODERATION',
    run: async (ctx) => {
        const isAdmin = (await ctx.getChatAdministrators()).some(acc => acc.user.id === ctx.from.id);
        if (!isAdmin && ctx.from.id.toString() !== process.env.OWNER_ID) {
            return ctx.reply("❌ <b>Access Denied.</b> Minimum clearance not met.", { parse_mode: 'HTML' });
        }

        if (!ctx.message.reply_to_message) {
            return ctx.reply("⚠️ <b>System Error:</b> Reply to the entity you wish to disconnect.");
        }

        const target = ctx.message.reply_to_message.from;

        try {
            // Unban immediately after kicking to allow rejoin
            await ctx.banChatMember(target.id);
            await ctx.unbanChatMember(target.id);

            const kickLog = `
👢 <b>MEMBER DISCONNECTED</b>
━━━━━━━━━━━━━━━━━━
👤 <b>ENTITY:</b> ${target.first_name}
🛡️ <b>MODERATOR:</b> ${ctx.from.first_name}
📝 <b>LOG:</b> Operational necessity.
━━━━━━━━━━━━━━━━━━
<i>Eagle Community | Security Module</i>`;

            await ctx.replyWithHTML(kickLog);
        } catch (error) {
            ctx.reply("❌ <b>Failure:</b> Execution error during disconnect.");
        }
    }
};
