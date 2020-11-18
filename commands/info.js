const Discord = require('discord.js')
const db = require('quick.db');

const config = require('../config.json');

module.exports = {
	name: 'info',
	description: 'Show information about the bot.',
	aliases: ['uptime'],
	usage: '',
	cooldown: 5,
	execute(message, args, client) {
		let totalSeconds = (client.uptime / 1000);
		let days = Math.floor(totalSeconds / 86400);
		totalSeconds %= 86400;
		let hours = Math.floor(totalSeconds / 3600);
		totalSeconds %= 3600;
		let minutes = Math.floor(totalSeconds / 60);
		let seconds = Math.floor(totalSeconds % 60);

		const verifiedUsers = db.all().filter(record => record.data.verified === true);

		const informationEmbed = new Discord.MessageEmbed()
			.setColor(config.theme.generalColor)
			.setTitle('Information')
			.setDescription(`Naiden is a multi-purpose Discord bot used in the Portland Public Schools server. Use \`${config.prefix}help\` to get a list of commands.\n\n<:github:768932901965791322> [**SOURCE CODE**](https://github.com/nickpdx/naiden)`)
			.setThumbnail('https://i.imgur.com/CFgCO1d.png')
			.addFields(
				{ name: `Uptime`, value: `Online for ${days} day(s), ${hours} hour(s), ${minutes} minute(s) and ${seconds} seconds`, inline: true },
				{ name: `Latency`, value: `It took \`${Date.now() - message.createdTimestamp}ms\` for your message to reach me`, inline: true },
				{ name: `Members`, value: `There are **${verifiedUsers.length}** verified members`, inline: true },
			);
		message.channel.send(informationEmbed)
			.catch((error) => {
				console.error(`Failed to send message in #${channel.name} (${channel.id}) in ${channel.guild.name} (${channel.guild.id})
			* ${error}`);
			});
	},
};
