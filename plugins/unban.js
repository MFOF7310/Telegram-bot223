module.exports = {
    name: 'unban',
    aliases: ['pardon', 'restore'],
    run: async (ctx) => {
        // 1. Permission Check
        const isAdmin = ctx.chat.type === 'private' || 
            (await ctx.getChatAdministrators().catch(() => [])).some(acc => acc.user.id === ctx.from.id);
        
        if (!isAdmin && ctx.from.id.toString() !== process.env.OWNER_ID) {
            return ctx.reply("⛔ Admin clearance required for restoration.");
        }

        // 2. Identify Target (by Reply or by ID)
        const args = ctx.message.text.split(' ');
        let targetId;

        if (ctx.message.reply_to_message) {
            targetId = ctx.message.reply_to_message.from.id;
        } else if (args[1]) {
            targetId = args[1];
        } else {
            return ctx.reply("⚠️ Reply to a message or provide a User ID to unban.");
        }

        try {
            // 3. Lift the restriction
            await ctx.unbanChatMember(targetId, { only_if_banned: true });

            // 4. Confirmation
            const unbanMsg = 
                `🔓 <b>RESTRICTION LIFTED</b>\n` +
                `━━━━━━━━━━━━━━\n` +
                `🆔 <b>UID:</b> <code>${targetId}</code>\n` +
                `🛰️ <b>Status:</b> Operative cleared for re-entry.`;

            await ctx.replyWithHTML(unbanMsg);
            
            // Cleanup command
            await ctx.deleteMessage().catch(() => {});

        } catch (e) {
            ctx.reply(`❌ Failed to unban: ${e.message}`);
        }
    }
};
