const googleTTS = require('google-tts-api');

module.exports = {
    name: 'tts',
    aliases: ['speak'],
    category: 'UTILITY',
    run: async (ctx) => {
        const text = ctx.message.text.split(' ').slice(1).join(' ') || (ctx.message.reply_to_message?.text);
        if (!text) return ctx.reply("💡 Provide text or reply to a message.");

        const isFrench = /[éàèêëîïôûùç]/i.test(text);
        const url = googleTTS.getAudioUrl(text.slice(0, 200), { lang: isFrench ? 'fr-FR' : 'en-US' });

        await ctx.replyWithAudio({ url }, { caption: `🎙️ <b>Synthesized in ${isFrench ? 'French' : 'English'}</b>`, parse_mode: 'HTML' });
    }
};
