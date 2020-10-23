const Discord = require('discord.js')
const { prefix, verifiedRole, guildID } = require('../config.json');

module.exports = {
	name: 'info',
	description: 'Show information about the bot.',
	aliases: ['uptime'],
	usage: '[command name]',
	cooldown: 5,
	execute(message, args, client) {
    let totalSeconds = (client.uptime / 1000);
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);

		// Get verifiedRole amount
		const guild = client.guilds.cache.get(guildID);
		const role = guild.roles.cache.get(verifiedRole);

		const embed = new Discord.MessageEmbed()
			.setColor('#fc54a0')
			.setTitle('Information')
			.setDescription(`Naiden is a multi-purpose Discord bot used in the Portland Public Schools server. Use \`${prefix}help\` to get a list of commands.\n\n<:github:768932901965791322> [**SOURCE CODE**](https://github.com/nickpdx/naiden)`)
      .setThumbnail('https://i.imgur.com/CFgCO1d.png')
			.addFields(
				{ name: `Uptime`, value: `Online for ${days} day(s), ${hours} hour(s), ${minutes} minute(s) and ${seconds} seconds`, inline: true },
				{ name: `Latency`, value: `It took ${Date.now() - message.createdTimestamp} milliseconds for your message to reach me`, inline: true },
				{ name: `Members`, value: `There are currently ${role.members.size} <@&${verifiedRole}> members`, inline: true },
			)
		message.channel.send(embed);
	},
};
