const Discord = require('discord.js')
const db = require('quick.db');

const mentionParse = require('../modules/mentionParse.js')

const config = require('../config.json');

module.exports = {
	"enabled": true,
	name: 'message',
	description: 'Message a user',
	usage: '[user] [message]',
	aliases: ['dm'],
	cooldown: 5,
	args: true,
	guildOnly: true,
	mainGuildOnly: true,
	async execute(message, args, client) {
		if (message.member.roles.cache.has(config.adminRole)) {
			const mention = await mentionParse(args[0], 'user', true, client);

			if (mention) {
				const user = await client.users.fetch(mention)
					.then((result) => {
						return result;
					})
					.catch((error) => {
						return console.error(`Failed to fetch user ${mention}
							* ${error}`);
					});

				if (user) {
					args.splice(0, 1)

					const messageString = args.join(' ');
					user.send(messageString)
						.then((result) => {
							const successEmbed = new Discord.MessageEmbed()
								.setColor(config.theme.successColor)
								.setTitle('✅ Success')
								.setDescription(`Sent message to <@${mention}>`);
							return message.channel.send(successEmbed)
								.catch((error) => {
									console.log(`Failed to send message in #${message.channel.name} (${message.channel.id}) in ${message.guild.name} (${message.guild.id})
							* ${error}`);
								});
						})
						.catch((error) => {
							const messageErrorEmbed = new Discord.MessageEmbed()
								.setColor(config.theme.errorColor)
								.setTitle('❌ An error occured')
								.setDescription(`Failed to send message to <@${mention}>, they may have DMs disabled, or have blocked Naiden`);
							return message.channel.send(messageErrorEmbed)
								.catch((error) => {
									console.log(`Failed to send message in #${message.channel.name} (${message.channel.id}) in ${message.guild.name} (${message.guild.id})
							* ${error}`);
								});
						});
				} else {
					const fetchErrorEmbed = new Discord.MessageEmbed()
						.setColor(config.theme.errorColor)
						.setTitle('❌ An error occured')
						.setDescription(`An error occured while trying to fetch that user, contact an administrator about this issue`);
					return message.channel.send(fetchErrorEmbed)
						.catch((error) => {
							console.log(`Failed to send message in #${message.channel.name} (${message.channel.id}) in ${message.guild.name} (${message.guild.id})
			* ${error}`);
						});
				};
			} else {
				const noPermissionEmbed = new Discord.MessageEmbed()
					.setColor(config.theme.errorColor)
					.setTitle('❌ An error occured')
					.setDescription(`You didn't specify a valid user`);
				return message.channel.send(noPermissionEmbed)
					.catch((error) => {
						console.log(`Failed to send message in #${message.channel.name} (${message.channel.id}) in ${message.guild.name} (${message.guild.id})
					* ${error}`);
					});
			};
		} else {
			const noPermissionEmbed = new Discord.MessageEmbed()
				.setColor(config.theme.errorColor)
				.setTitle('❌ Insufficent Permission')
				.setDescription(`Contact an administrator if you believe this is an error`);
			return message.channel.send(noPermissionEmbed)
				.catch((error) => {
					console.log(`Failed to send message in #${message.channel.name} (${message.channel.id}) in ${message.guild.name} (${message.guild.id})
					* ${error}`);
				});
		};
	},
};
