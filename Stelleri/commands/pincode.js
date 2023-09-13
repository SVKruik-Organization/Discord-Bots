const { SlashCommandBuilder } = require('discord.js');
const modules = require('..');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pincode')
        .setDescription('Change or get your 4-digit pincode.')
        .addStringOption(option =>
            option.setName('action')
                .setDescription('Choose what you want to do with your pincode.')
                .setRequired(true)
                .addChoices(
                    { name: 'Get Pincode', value: 'get' },
                    { name: 'Change Pincode', value: 'change' }
                ))
        .addStringOption(option => option.setName('new-pincode').setDescription("Your new pincode. Leave blank if you don't want to change it.").setRequired(false).setMaxLength(4).setMinLength(4)),
    async execute(interaction) {
        const snowflake = interaction.user.id;
        const username = interaction.user.username;
        const actionType = interaction.options.getString('action');
        const newPincode = interaction.options.getString('new-pincode');

        if (actionType == "get") {
            modules.database.promise()
                .execute(`SELECT pincode AS pin FROM user WHERE snowflake = '${snowflake}';`)
                .then(async ([data]) => {
                    await interaction.reply({ content: `Your Pincode is: \`${data[0].pin}\`.`, ephemeral: true });
                }).catch(() => {
                    return interaction.reply({ content: "You do not have an account yet. Create an account with the `/register` command.", ephemeral: true });
                });
        } else if (actionType == "change" && newPincode != null) {
            modules.database.promise()
                .execute(`UPDATE user SET pincode = '${newPincode}' WHERE snowflake = '${snowflake}';`)
                .then(async () => {
                    await interaction.reply({ content: `Your pincode has been succesfully changed. New pincode: \`${newPincode}\`.`, ephemeral: true });
                }).catch(() => {
                    return interaction.reply({ content: "You do not have an account yet. Create an account with the `/register` command.", ephemeral: true });
                });
        } else {
            await interaction.reply({ content: "With this actiontype you need to fill in the optional input, the new pincode. Please try again.", ephemeral: true });
        };

        modules.commandUsage(snowflake, username);
    },
};