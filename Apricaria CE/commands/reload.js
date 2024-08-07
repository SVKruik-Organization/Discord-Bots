const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../config.js');
const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
const logger = require('../utils/logger.js');

const commands = [];
for (const file of commandFiles) {
    try {
        if (file === "reload.js") continue;
        const command = require(`../commands/${file}`);
        if (command && ('data' in command)) {
            commands.push(command.data.toJSON());
        } else logger.log(`Reload error at ${file}`, "error");
    } catch (error) {
        logger.error(error);
    }
}

module.exports = {
    cooldown: config.cooldowns.A,
    data: new SlashCommandBuilder()
        .setName('reload')
        .setNameLocalizations({
            nl: "herladen"
        })
        .setDescription('Reload all commands.')
        .setDescriptionLocalizations({
            nl: "Herlaadt all commando's."
        })
        .setDMPermission(true)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        try {
            // Permission Validation
            if (interaction.user.id !== config.general.authorId) return interaction.reply({
                content: `This command is reserved for my developer, <@${config.general.authorId}>, only. If you are experiencing problems with (one of) the commands, please contact him.`,
                ephemeral: true
            });

            interaction.reply({
                content: `Reloading commands. One moment please.`,
                ephemeral: true
            });

            const data = await rest.put(
                Routes.applicationCommands(config.general.clientId),
                { body: commands },
            );
            logger.log(`Successfully reloaded ${data.length} Global commands.`);
            return interaction.followUp({
                content: `Successfully reloaded all Global commands for all servers ${config.general.name} is in.`,
                ephemeral: true
            });
        } catch (error) {
            logger.error(error);
            return interaction.followUp({
                content: `Something went wrong while reloading Global commands.`,
                ephemeral: true
            });
        }
    }
};