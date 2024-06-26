const { Events } = require('discord.js');
const modules = require('..');
const config = require('../assets/config.js');
const userIncreaseHandler = require('../handlers/userIncreaseHandler.js');
const guildUtils = require('../utils/guild.js');
const operatorHandler = require('../handlers/operatorHandler.js');

module.exports = {
    name: Events.MessageCreate,
    execute(message) {
        if (message.author.bot) return;

        // Guild Message - XP Increase
        if (message.guildId) {
            const targetGuild = guildUtils.findGuildById(message.guild.id);
            let xpReward = config.tier.normalMessage;
            if (targetGuild && targetGuild.xp_increase_normal) xpReward = targetGuild.xp_increase_normal;
            userIncreaseHandler.increaseXp({
                "user": message.author,
                "client": modules.client,
                "channelId": message.channelId,
                "guild": {
                    "id": message.guild.id
                }
            }, xpReward);
        } else if (message.content.startsWith(process.env.DM_COMMAND_PREFIX)) {

            // DM Message - Commands
            switch (message.content) {
                case `${process.env.DM_COMMAND_PREFIX}operatorDecline`:
                    operatorHandler.handleDeclineInit(message);
                    break;
                default:
                    message.reply(`Hello there, <@${message.author.id}>! \`${message.content}\` is not a valid DM command.`);
                    break;
            }
        }
    }
};