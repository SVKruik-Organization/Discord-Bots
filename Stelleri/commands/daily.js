const { SlashCommandBuilder } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');

module.exports = {
    cooldown: config.cooldowns.E,
    data: new SlashCommandBuilder()
        .setName('dailyreward')
        .setDescription('Collect your daily reward.')
        .addIntegerOption(option => option.setName('jackpot').setDescription('A number between 200 and 1000. There is a 1 in 800 chance you hit the jackpot.').setRequired(false).setMinValue(200).setMaxValue(1000)),
    async execute(interaction) {
        const username = interaction.user.username;
        const snowflake = interaction.user.id;
        let jackpot = interaction.options.getInteger('jackpot');
        if (jackpot == undefined) jackpot == 199;
        let dailyreward = Math.floor(Math.random() * (1001 - 200) + 200);

        let jackpotValue = undefined;
        let jackpotBoolean = false;
        if (jackpot == dailyreward) {
            jackpotBoolean = true;
            jackpotValue = 10000;
        } else jackpotValue = 0;

        await modules.database.query("UPDATE economy SET wallet = wallet + ? + ? WHERE snowflake = ?;", [jackpotValue, dailyreward, snowflake])
            .then(() => {
                interaction.reply(`Succesfully collected your daily reward: \`${dailyreward}\` Bits. Be sure to come back tomorrow!`);
                modules.log(`${interaction.user.username} collected their daily reward. They received ${dailyreward} bits.`, "info");
                if (jackpotBoolean == true) {
                    interaction.followUp(`💎 You hit the JACKPOT! 💎 You received \`${jackpotValue}\` more Bits. Congratulations! 🎉`);
                    const total = jackpotValue + dailyreward;
                    modules.log(`${username} hit the daily reward jackpot. He/she received a total of ${total} Bits.\n`, "info");
                };
            }).catch(() => {
                return interaction.reply({ content: "You do not have an account yet. Create an account with the `/register` command.", ephemeral: true });
            });
    }
};