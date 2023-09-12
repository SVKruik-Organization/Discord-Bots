const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const modules = require('..');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Bulk delete messages.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option => option.setName('amount').setDescription('Amount of messages to delete.').setRequired(true).setMinValue(1).setMaxValue(100)),
    async execute(interaction) {
        const snowflake = interaction.user.id;
        const username = interaction.user.username;
        const amount = interaction.options.getInteger('amount');

        await interaction.reply("Deleting `" + amount + "` messages . . .");
        setTimeout(async () => {
            await interaction.channel.bulkDelete(amount + 1);
        }, 1000);

        modules.database.promise()
            .execute(`UPDATE user SET commands_used = commands_used + 1 WHERE snowflake = '${snowflake}';`)
            .catch(() => {
                return modules.log(`Command usage increase unsuccessful, ${username} does not have an account yet.`, "warning");
            });
    },
};