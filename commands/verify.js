const Discord = require('discord.js');
const db = require('quick.db');

const mentionParse = require('../modules/mentionParse.js');

const config = require(`../config.json`);

module.exports = {
	name: 'verify',
	description: 'Verifies the specified member',
	guildOnly: true,
	mainGuildOnly: true,
	cooldown: 5,
	args: true,
	async execute(message, args, client) {
		if (message.member.roles.cache.has(config.adminRole)) {
			const userID = mentionParse(args[0], 'user', false);

			if (userID && /^[a-zA-Z0-9\.]+@(pps.net|student.pps.net)$/.test(args[1])) {
				// Set associated keys in database
				db.delete(`${args[0]}.code`);
				db.delete(`${args[0]}.codeExpiration`);
				db.set(`${args[0]}.verified`, true);
				db.set(`${args[0]}.email`, args[1]);

				const embed = new Discord.MessageEmbed()
					.setColor(config.theme.successColor)
					.setTitle('✅ Success')
					.setDescription(`Verified <@${args[0]}>\n**❗ Remember to give them the required roles**`);
				return message.channel.send(embed)
					.catch((error) => {
						console.log(`Failed to send message in #${message.channel.name} (${message.channel.id}) in ${message.guild.name} (${message.guild.id})
						* ${error}`);
					});
			} else {
				const embed = new Discord.MessageEmbed()
					.setColor(config.theme.errorColor)
					.setTitle('❌ Incorrect Usage')
					.setDescription(`You didn't specify a valid user or you used an invalid PPS email.`);
				return message.channel.send(embed)
					.catch((error) => {
						console.log(`Failed to send message in #${message.channel.name} (${message.channel.id}) in ${message.guild.name} (${message.guild.id})
					* ${error}`);
					});
			};
		} else {
			const embed = new Discord.MessageEmbed()
				.setColor(config.theme.errorColor)
				.setTitle('❌ Insufficent Permission')
				.setDescription(`That command requires the <@&${adminRole}> role`);
			return message.channel.send(embed)
				.catch((error) => {
					console.log(`Failed to send message in #${message.channel.name} (${message.channel.id}) in ${message.guild.name} (${message.guild.id})
					* ${error}`);
				});
		};
	},
};
