const Discord = require('discord.js')
const { prefix } = require('../config.json');

module.exports = {
	name: 'help',
	description: 'List all commands',
	aliases: ['commands'],
	usage: '',
	cooldown: 5,
	execute(message, args, client) {
		const embed = new Discord.MessageEmbed()
			.setColor('#fcdb60')
			.setTitle('Help Menu')
			.setDescription('Arguments surrounded in `<>` are __optional__, and arguments surrounded in `[]` are __required__. Most commands can also be messaged to me directly!')
			.addFields(
				{ name: `${prefix}help`, value: 'Shows you this menu', inline: true },
				{ name: `${prefix}ping`, value: 'Replies with "Pong!", used to test latency', inline: true },
				{ name: `${prefix}info`, value: 'Shows information about the bot', inline: true },
				{ name: `${prefix}refreshverify <@mention|id>`, value: 'Refreshes verification for yourself or the specified member', inline: true },
				{ name: `${prefix}config [setting] [value]`, value: 'Change settings for current guild', inline: true },
				{ name: `${prefix}highscore`, value: 'Shows the current High Score of the server', inline: true },
				{ name: `${prefix}nextnumber`, value: 'Says the next number for the server', inline: true },
			)
		message.channel.send(embed);
	},
};
