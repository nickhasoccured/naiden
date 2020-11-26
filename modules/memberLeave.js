const Discord = require('discord.js');
const db = require('quick.db');

const config = require('../config.json');

module.exports = {
    "name": "memberLeave",
    "startup": true,
    execute(client) {
        client.on('guildMemberRemove', member => {
            if (member.guild.id === config.mainGuild) {
                const guildWelcomeChannel = db.get(`${member.guild.id}.welcomeChannel`)
                const channel = member.guild.channels.cache.get(guildWelcomeChannel);
                if (channel) {
                    const embed = new Discord.MessageEmbed()
                        .setColor(config.theme.errorColor)
                        .setTitle(`👋 Goodbye, ${member.user.username}`);
                    channel.send(embed)
                        .catch((error) => {
                            console.log(`Failed to send message in #${message.channel.name} (${message.channel.id}) in ${message.guild.name} (${message.guild.id})
                    * ${error}`);
                        });
                };
            };
        });
    },
};