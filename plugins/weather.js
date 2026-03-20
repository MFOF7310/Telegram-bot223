const axios = require('axios');

module.exports = {
    name: 'weather',
    aliases: ['w', 'temp'],
    category: 'UTILITY',
    run: async (ctx) => {
        const args = ctx.message.text.split(' ');
        const city = args.slice(1).join(' ') || 'Bamako'; // Defaults to your home node
        const apiKey = process.env.WEATHER_API_KEY;

        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
            const response = await axios.get(url);
            const data = response.data;

            const temp = Math.round(data.main.temp);
            const condition = data.weather[0].main.toUpperCase();
            const humidity = data.main.humidity;

            // Tactical advice based on temperature
            let advice = temp > 35 ? "⚠️ <b>EXTREME HEAT:</b> Hydration levels critical." : "🟢 <b>STABLE:</b> Environment within normal parameters.";

            const report = `
🌍 <b>METEOROLOGICAL REPORT: ${data.name.toUpperCase()}</b>
━━━━━━━━━━━━━━━━━━
🌡️ <b>TEMP:</b> <code>${temp}°C</code>
☁️ <b>SKY:</b> <code>${condition}</code>
💧 <b>HUMIDITY:</b> <code>${humidity}%</code>

📊 <b>ANALYSIS:</b> <i>${advice}</i>
━━━━━━━━━━━━━━━━━━
📍 <i>Satellite Node: Bamako-223</i>`;

            await ctx.replyWithHTML(report);
        } catch (error) {
            ctx.replyWithHTML("❌ <b>ERROR:</b> Region not found in global weather archives.");
        }
    }
};
