const modules = require('..');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const logger = require('../utils/logger.js');

/**
 * Send a pair of confirmation buttons.
 * @param {object} interaction Discord Interaction Object
 */
function sendConfirmButtons(interaction) {
    const cancel = new ButtonBuilder()
        .setCustomId('cancelAccountClose')
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary);

    const confirm = new ButtonBuilder()
        .setCustomId('confirmAccountClose')
        .setLabel("Close Account")
        .setStyle(ButtonStyle.Danger);

    interaction.reply({
        content: 'Everything is ready. Are you sure you want to close your account? You will lose all your data (purchase history, Bits, Level, etcetera).',
        components: [new ActionRowBuilder().addComponents(cancel, confirm)],
        ephemeral: true
    });
}

/**
 * Confirm account deletion.
 * @param {object} interaction Discord Interaction Object
 */
function confirmAccountClose(interaction) {
    modules.database.query("DELETE FROM user_general WHERE snowflake = ?;", [interaction.user.id])
        .then((data) => {
            if (!data.affectedRows) return interaction.update({
                content: "This command requires you to have an account. Create an account with the `/register` command.",
                components: [],
                ephemeral: true
            });

            interaction.update({
                content: "Your account has been successfully closed. If you ever change your mind, you can always create a new account with the `/register` command. Cya!",
                components: [],
                ephemeral: true
            });
        }).catch((error) => {
            logger.error(error);
            return interaction.update({
                content: "Something went wrong while closing your account. Please try again later.",
                components: [],
                ephemeral: true
            });
        });
}

/**
 * Cancel account deletion.
 * @param {object} interaction Discord Interaction Object
 */
function cancelAccountClose(interaction) {
    interaction.update({
        content: `Phew! Almost thought I lost you there. If you have questions or concerns, don't hesitate to contact moderation.`,
        components: [],
        ephemeral: true
    });
}

module.exports = {
    "confirmAccountClose": confirmAccountClose,
    "cancelAccountClose": cancelAccountClose,
    "sendConfirmButtons": sendConfirmButtons
}