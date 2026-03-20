const { translate } = require('google-translate-api-x');

module.exports = {
    name: 'trt',
    aliases: ['translate'],
    category: 'UTILITY',
    run: async (ctx) => {
        const args = ctx.message.text.split(' ');
        const targetLang = args[1] || 'fr';
        const text = args.slice(2).join(' ') || (ctx.message.reply_to_message?.text);

        if (!text) return ctx.reply("❌ Provide text or reply to a message.");

        try {
            const res = await translate(text, { to: targetLang });
            ctx.replyWithHTML(`🌍 <b>TRANSLATION</b>\n━━━━━━━━━━━━━━━━━━\n📥 <b>FROM:</b> ${res.from.language.iso.toUpperCase()}\n📤 <b>TO:</b> ${targetLang.toUpperCase()}\n\n<code>${res.text}</code>`);
        } catch (e) { ctx.reply("❌ Translation Failed."); }
    }
};
