module.exports = {
    name: 'ban',
    run: async (ctx) => {
        const userId = ctx.from.id.toString();
        const isAdmin = (await ctx.getChatAdministrators()).some(acc => acc.user.id === ctx.from.id);
        const isOwner = userId === process.env.OWNER_ID;

        if (!isAdmin && !isOwner) {
            return ctx.reply("❌ <b>Access Denied.</b> Authority level insufficient.");
        }

        // Check if it's a reply to a user
        if (!ctx.message.reply_to_message) {
            return ctx.reply("⚠️ <b>System Error:</b> Reply to the entity you wish to ban.");
        }

        const target = ctx.message.reply_to_message.from;
        
        try {
            await ctx.banChatMember(target.id);
            
            const banLog = `
⚖️ <b>JUDGMENT RENDERED</b>
━━━━━━━━━━━━━━━━━━
👤 <b>ENTITY:</b> ${target.first_name}
🛡️ <b>AUTHORIZED BY:</b> ${ctx.from.first_name}
📝 <b>LOG:</b> Permanent Node Exclusion
━━━━━━━━━━━━━━━━━━
<i>Eagle Community Security | Protocol: Ban</i>`;

            await ctx.replyWithHTML(banLog);
        } catch (error) {
            ctx.reply("❌ <b>Critical Failure.</b> Check my Admin permissions.");
        }
    }
};
