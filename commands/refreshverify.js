const Discord = require('discord.js')
const db = require('quick.db');

const mentionParse = require('../modules/mentionParse.js');

const config = require('../config.json');

module.exports = {
	"enabled": true,
	name: 'refreshverify',
	description: 'Description',
	usage: '<member>',
	aliases: ['verifyrefresh', 'refreshverification', 'verificationrefresh', 'checkverify', 'checkverification', 'verificationcheck', 'verifycheck'],
	cooldown: 0,
	args: false,
	guildOnly: true,
	execute(message, args, client) {

		let specifiedUser;
		if (args[0]) {
			specifiedUser = mentionParse(args[0], 'member', true, client, message.guild);

			if (!specifiedUser) {
				const embed = new Discord.MessageEmbed()
					.setColor(config.theme.errorColor)
					.setTitle('❌ Incorrect Usage')
					.setDescription(`The member you specified isn't in this server, or your mention is invalid.`);
				return message.channel.send(embed)
					.catch((error) => {
						message.channel.send(embed)
							.catch((error) => {
								console.log(`Failed to send message in #${message.channel.name} (${message.channel.id}) in ${message.guild.name} (${message.guild.id})
							* ${error}`);
							});
					});
			};
		} else {
			specifiedUser = message.author.id;
		};

		const member = message.guild.members.cache.get(specifiedUser);

		const isVerified = db.get(`${member.user.id}.verified`) || false;
		const verifiedRole = db.get(`${message.guild.id}.verifiedRole`) || false;

		if (isVerified && verifiedRole && !member.roles.cache.has(verifiedRole)) {
			member.roles.add(verifiedRole)
				.catch((error) => {
					console.error(`Failed to give verifiedRole (${verifiedRole}) to ${member.user.username}#${member.user.tag} (${member.user.id}) in ${message.guild.name} (${message.guild.id})
					* ${error}`)
					const embed = new Discord.MessageEmbed()
						.setColor(config.theme.errorColor)
						.setTitle('❌ An error occured')
						.setDescription(`Contact your server administrator about this issue.`);
					return message.channel.send(embed)
						.catch((error) => {
							message.channel.send(embed)
								.catch((error) => {
									console.log(`Failed to send message in #${message.channel.name} (${message.channel.id}) in ${message.guild.name} (${message.guild.id})
									* ${error}`);
								});
						});
				})
				.then((value) => {
					const embed = new Discord.MessageEmbed()
						.setColor(config.theme.successColor)
						.setTitle('✅ Success')
						.setDescription(`Refreshed verification for ${member.displayName}, they're now verified!`)
					message.channel.send(embed)
						.catch((error) => {
							console.log(`Failed to send message in #${message.channel.name} (${message.channel.id}) in ${message.guild.name} (${message.guild.id})
							* ${error}`);
						});
				});
		} else {
			const embed = new Discord.MessageEmbed()
				.setColor(config.theme.pendingColor)
				.setTitle('👍 Success')
				.setDescription(`Refreshed verification for ${member.displayName}, nothing changed.`);
			message.channel.send(embed)
				.catch((error) => {
					console.log(`Failed to send message in #${message.channel.name} (${message.channel.id}) in ${message.guild.name} (${message.guild.id})
				* ${error}`);
				});
		};
	},
};