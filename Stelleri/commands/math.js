const { SlashCommandBuilder } = require('discord.js');
const math = require('mathjs');
const config = require('../assets/config.js');

module.exports = {
    cooldown: config.cooldowns.B,
    data: new SlashCommandBuilder()
        .setName('math')
        .setDescription('Evaluate a math expression.')
        .addStringOption(option => option
            .setName('expression')
            .setDescription('The math expression to be solved. Example: 4 * 4.')
            .setRequired(true)),
    async execute(interaction) {
        const expression = interaction.options.getString('expression');

        try {
            const answer = math.evaluate(expression).toString();
            interaction.reply(`Expression: \`${expression}\`\n\nResult: \`${answer}\``);
        } catch (err) {
            interaction.reply({ content: `Invalid expression.`, ephemeral: true });
        }
    }
};