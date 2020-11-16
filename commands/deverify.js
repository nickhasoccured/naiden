const Discord = require('discord.js');
const db = require('quick.db');

const config = require('../config.json');

module.exports = {
	name: 'deverify',
	description: 'Removes verification from the specified user',
	guildOnly: true,
	mainGuildOnly: true,
	cooldown: 5,
	args: true,
	async execute(message, args, client) {
		if (message.member.roles.cache.has(config.adminRole)) {
			const isVerified = db.get(`${args[0]}.verified`)
			if (isVerified) {
				db.delete(`${args[0]}.email`);
				db.delete(`${args[0]}.verified`);

				const embed = new Discord.MessageEmbed()
					.setColor(config.theme.successColor)
					.setTitle('✅ Success')
					.setDescription(`Removed verification records for <@${args[0]}>`);
				message.channel.send(embed);
			} else {
				const embed = new Discord.MessageEmbed()
					.setColor(config.theme.errorColor)
					.setTitle('❌ An error occured')
					.setDescription(`That user isn't verified`);
				message.channel.send(embed);
			}
		} else {
			const embed = new Discord.MessageEmbed()
				.setColor(config.theme.errorColor)
				.setTitle('❌ Insufficent Permission')
				.setDescription(`That command requires the <@&${config.adminRole}> role`);
			message.channel.send(embed);
		};

	},
};
