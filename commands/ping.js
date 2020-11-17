const Discord = require('discord.js');

const config = require('../config.json');

module.exports = {
	name: 'ping',
	description: 'Test latency of bot',
	usage: '',
	aliases: ['pong'],
	cooldown: 5,
	args: false,
	guildOnly: false,
	mainGuildOnly: false,
	execute(message, args, client) {
		const verifyConfirmMessage = new Discord.MessageEmbed()
			.setColor(config.theme.successColor)
			.setTitle('Pong!')
			.setDescription(`It took \`${Date.now() - message.createdTimestamp}ms\` for your message to reach me.`);
		message.channel.send(embed)
			.catch((error) => {
				console.error(`Failed to send message to ${message.author.username}#${message.author.tag} (${message.author.id})
				* ${error}`);
			});
	},
};
