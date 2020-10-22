const Discord = require('discord.js')
const { prefix } = require('../config.json');

module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	aliases: ['commands'],
	usage: '[command name]',
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
			)
		message.channel.send(embed);
	},
};
