const Discord = require('discord.js')
const db = require('quick.db');

const config = require('../config.json');

const validSettings = ['verifiedRole', 'welcomeChannel', 'countingChannel'];

module.exports = {
	name: 'config',
	description: 'Change settings for the current server',
	usage: '[setting] <value>',
	aliases: ['settings', 'setting'],
	cooldown: 10,
	args: false,
	guildOnly: true,
	execute(message, args, client) {
		// Check that the user has the MANAGE_GUILD permission
		if (message.member.hasPermission('MANAGE_GUILD')) {
			let guildConfig = db.get(message.guild.id) || {};
			const currentValidSettings = validSettings.filter(setting => setting === args[0]);

			for (const setting of validSettings) {
				if (!(setting in guildConfig)) {
					db.set(`${message.guild.id}.${setting}`, false);
				};
			};

			guildConfig = db.get(message.guild.id);

			// Embed template (changes based on result)
			const embed = new Discord.MessageEmbed()
				.setColor(config.theme.successColor)
				.setTitle('⚙️ Server Configuration')
				.setDescription(
					`Use \`${config.prefix}config [setting] [value]\` to configure a setting, arguments are case sensitive!
					
					▫️ \`verifiedRole = ${guildConfig.verifiedRole}\` - ID of the verification role for this server, or \`false\`
					▫️ \`welcomeChannel = ${guildConfig.welcomeChannel}\` - ID of the channel which welcome messages are sent, or \`false\`
					▫️ \`countingChannel = ${guildConfig.countingChannel}\` - ID of the channel where the counting game takes place, or \`false\``
				);
			// If there are arguments
			if (args.length) {
				// If the first argument is valid & the second argument exists
				if (currentValidSettings.length && args[1]) {
					db.set(`${message.guild.id}.${args[0]}`, args[1]);
					guildConfig = db.get(message.guild.id);

					embed.setTitle('✅ Success')
					embed.setDescription(
						`Changed setting for this server.
						Use \`${config.prefix}config [setting] [value]\` to configure a setting, arguments are case sensitive!
					
						▫️ \`verifiedRole ${guildConfig.verifiedRole}\` - ID of the verification role for this server`
					);
					embed.setColor(config.theme.successColor);
					message.channel.send(embed)
						.catch((error) => {
							console.error(`Failed to send message in #${message.channel.name} (${message.channel.id}) in ${message.guild.name} (${message.guild.id})
						* ${error}`);
						});

				} else {
					embed.setColor(config.theme.errorColor);
					message.channel.send(embed)
						.catch((error) => {
							console.error(`Failed to send message in #${message.channel.name} (${message.channel.id}) in ${message.guild.name} (${message.guild.id})
						* ${error}`);
						});
				};
			} else {
				embed.setColor(config.theme.successColor);
				message.channel.send(embed)
					.catch((error) => {
						console.error(`Failed to send message in #${message.channel.name} (${message.channel.id}) in ${message.guild.name} (${message.guild.id})
					* ${error}`);
					});
			};
		// Permission error
		} else {
			const embed = new Discord.MessageEmbed()
				.setColor(config.theme.errorColor)
				.setTitle('❌ Insufficent Permission')
				.setDescription(`That command requires the \`Manage Guild\` permission`);
			message.channel.send(embed)
				.catch((error) => {
					console.error(`Failed to send message in #${message.channel.name} (${message.channel.id}) in ${message.guild.name} (${message.guild.id})
					* ${error}`);
				});
		};
	},
};
