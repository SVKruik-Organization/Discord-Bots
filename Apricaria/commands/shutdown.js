const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.js');
const modules = require('..');
const logger = require('../utils/logger.js');

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('shutdown')
        .setNameLocalizations({
            nl: "uitschakelen"
        })
        .setDescription(`Turn ${config.general.name} off. This action is irreversible from Discord, a manual restart required.`)
        .setDescriptionLocalizations({
            nl: `Zet ${config.general.name} uit. Deze actie is onomkeerbaar vanuit Discord, een handmatige herstart is vereist.`
        })
        .setDMPermission(true)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        try {
            // Permission Validation
            if (interaction.user.id !== config.general.authorId) return interaction.reply({
                content: `This command is reserved for my developer, <@${config.general.authorId}>, only. If you are experiencing problems with (one of) the commands, please contact him.`,
                ephemeral: true
            });

            // Database Connection
            await modules.database.end();
            logger.log("Terminated database connection. Shutting down.", "alert");

            await interaction.reply({ content: `${config.general.name} is logging off. Bye!` });
            setTimeout(() => process.exit(0), 1000);
        } catch (error) {
            logger.error(error);
        }
    }
};