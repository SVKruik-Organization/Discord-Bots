const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const logger = require('../utils/logger.js');
const modules = require('..');
const { dueAdd } = require('../utils/due.js');
const dateUtils = require('../utils/date.js');

/**
 * Returns a set of disabled buttons.
 * @param {object} interaction Discord Interaction Object
 * @returns Disabled buttons.
 */
function disabledButtons(interaction) {
    const confirmLabel = interaction.message.components[0].components[1].data.label;

    const disabledCancel = new ButtonBuilder()
        .setCustomId('cancelBoosterActivate')
        .setLabel(`Cancel`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const disabledConfirm = new ButtonBuilder()
        .setCustomId('confirmBoosterActivate')
        .setLabel(confirmLabel)
        .setStyle(ButtonStyle.Success)
        .setDisabled(true);

    return new ActionRowBuilder().addComponents(disabledCancel, disabledConfirm);
}

/**
 * Send confirmation message.
 * @param {object} interaction Discord Interaction Object
 * @param {string} value Type of XP-Booster to activate.
 * @returns On insufficient funds.
 */
function confirmActivateDialog(interaction, value) {
    const boosterType = value.split("-")[0];
    const boostersLeft = parseInt(value.split("-")[1]);

    if (boostersLeft === 0) {
        return interaction.update({
            content: `Unfortunately, you do not have any XP-Boosters of this type (\`${boosterType}\`) left. Check your available XP-Boosters with the \`/inventory overview\` command.`,
            components: [],
            ephemeral: true
        });
    }

    const cancel = new ButtonBuilder()
        .setCustomId('cancelBoosterActivate')
        .setLabel(`Cancel`)
        .setStyle(ButtonStyle.Secondary);

    const confirm = new ButtonBuilder()
        .setCustomId('confirmBoosterActivate')
        .setLabel(`Activate ${boosterType}`)
        .setStyle(ButtonStyle.Success);

    interaction.update({
        content: `Thank you for your selection. Are you sure you want to activate ${boosterType}?`,
        components: [new ActionRowBuilder().addComponents(cancel, confirm)],
        ephemeral: true
    });
}

/**
 * Activate a XP-Booster.
 * @param {object} interaction Discord Interaction Object
 * @returns On error.
 */
function confirmActivate(interaction) {
    try {
        const boosterType = interaction.message.components[0].components[1].data.label.split(" ")[1];

        // Sanitizing against SQL injection
        let row = null;
        if (boosterType === "xp15") {
            row = boosterType
        } else if (boosterType === "xp50") row = boosterType;
        if (!row) return interaction.update({
            content: `Something went wrong while preparing the systems. Please try again later.`,
            components: [],
            ephemeral: true
        });

        modules.database.query(`UPDATE user_inventory SET ${row} = ${row} - 1, xp_active = ?, xp_active_expiry = DATE_ADD(NOW(), INTERVAL 1 DAY) WHERE snowflake = ?;`, [boosterType, interaction.user.id])
            .then((data) => {
                // Validation
                if (!data.affectedRows) return interaction.reply({
                    content: "This command requires you to have an account. Create an account with the `/register` command.",
                    ephemeral: true
                });

                logger.log(`'${interaction.user.username}@${interaction.user.id}' has activated a XP-Booster ${boosterType} in guild '${interaction.guild ? interaction.guild.name : "DM_COMMAND"}@${interaction.guild ? interaction.guild.id : "DM_COMMAND"}'.`, "info");
                // + 24 Hours
                const newDate = dateUtils.getDate(null, null).today;
                newDate.setDate(newDate.getDate() + 1);
                dueAdd(interaction, boosterType, newDate, null);
                interaction.update({
                    content: `Success! Your XP-Booster has been activated for 24 hours, and is applied to all gained Experience.`,
                    components: [disabledButtons(interaction)],
                    ephemeral: true
                });
            }).catch((error) => {
                logger.error(error);
                return interaction.update({
                    content: `Something went wrong while updating your information. Please try again later.`,
                    components: [],
                    ephemeral: true
                });
            });
    } catch (error) {
        logger.error(error);
    }
}

/**
 * Cancel activation of a XP-Booster.
 * @param {object} interaction Discord Interaction Object
 */
function cancelActivate(interaction) {
    interaction.update({
        content: `Alright, no problem. 'Till next time!`,
        components: [disabledButtons(interaction)],
        ephemeral: true
    });
}

module.exports = {
    "confirmActivateDialog": confirmActivateDialog,
    "confirmActivate": confirmActivate,
    "cancelActivate": cancelActivate
}
