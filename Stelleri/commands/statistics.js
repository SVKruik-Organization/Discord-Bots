const { SlashCommandBuilder } = require('discord.js');
const config = require('../assets/config.js');
const { EmbedBuilder } = require('discord.js');
const fs = require("fs");
const modules = require('..');
const dateInfo = modules.getDate();
const date = dateInfo.date;
const time = dateInfo.time;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('statistics')
        .setDescription('Let the bot display some statistics.'),
    async execute(interaction) {
        const modules = require('..');
        const snowflake = interaction.user.id;
        const username = interaction.user.username;
        const pfp = interaction.user.avatarURL();
        const commands = fs.readdirSync("commands").length;
        const hours = Math.floor(modules.client.uptime / 3600000) % 24;
        const minutes = Math.floor(modules.client.uptime / 60000) % 60;
        const uptime = `\`${hours}\` hours and \`${minutes}\` minutes.`

        const embed = new EmbedBuilder()
            .setColor(config.general.color)
            .setTitle("Bot Statistics")
            .setAuthor({ name: username, iconURL: pfp })
            .addFields({ name: '----', value: 'List' })
            .addFields(
                { name: 'Name', value: "**Stelleri**" },
                { name: 'Creator', value: `<@422704748488163332>` },
                { name: 'Uptime', value: uptime },
                { name: 'Ping', value: `\`${modules.client.ws.ping}\`ms` },
                { name: 'Commands', value: `\`${commands}\` Total` },
                { name: 'Repository', value: `https://github.com/SVKruik/Discord-Bots-v2` },
                { name: 'Version', value: `\`v2.1.0\`` }
            )
            .addFields({ name: '----', value: 'Meta' })
            .setTimestamp()
            .setFooter({ text: 'Embed created by Stelleri' })
        interaction.reply({ embeds: [embed] });

        modules.database.promise()
            .execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
            .catch(() => {
                const data = `${time} [WARNING] Command usage increase unsuccessful, ${username} does not have an account yet.\n`;
                console.log(data);
                fs.appendFile(`./logs/${date}.log`, data, (err) => {
                    if (err) console.log(`${time} [ERROR] Error appending to log file.`);
                });
                return;
            });
    },
};