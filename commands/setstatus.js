const Discord = require('discord.js');

const config = require('../config.json');

module.exports = {
	name: 'setstatus',
	description: 'Sets the status of the bot.',
	aliases: ['setactivity'],
	guildOnly: true,
	mainGuildOnly: true,
	args: true,
	usage: '[type] [message]',
	cooldown: 5,
	execute(message, args, client) {
		// Permissions
		if (message.member.roles.cache.has(adminRole)) {
			editedArg = args[0].toUpperCase();
			if (editedArg === 'PLAYING' || editedArg === 'WATCHING' || editedArg === 'LISTENING' || editedArg === 'COMPETING') {

				// Remove first argument (activityType) so that rest of array is activityString
				args.splice(0, 1);
				const activityString = args.join(' ');

				// Set activity, send message
				client.user.setActivity(activityString, { type: editedArg })
					.catch((error) => {
						return console.log(`Failed to set activity to '${editedArg} ${activityString}'
						${error}`);
					})
					.then((value) => {
						const embed = new Discord.MessageEmbed()
							.setColor(config.theme.successColor)
							.setTitle('✅ Success')
							.setDescription(`Updated status`);
						message.channel.send(embed)
							.catch((error) => {
								console.log(`Failed to send message in #${message.channel.name} (${message.channel.id}) in ${message.guild.name} (${message.guild.id})
							* ${error}`);
							});
					});

			} else {
				const embed = new Discord.MessageEmbed()
					.setColor(config.theme.errorColor)
					.setTitle('❌ Incorrect Usage')
					.setDescription(`You didn't provide [a valid activity](https://hastebin.com/raw/vepepegowi) as the first argument`);
				message.channel.send(embed);
			};
		} else {
			const embed = new Discord.MessageEmbed()
				.setColor(config.theme.errorColor)
				.setTitle('❌ Insufficent Permission')
				.setDescription(`That command requires the <@&${adminRole}> role`);
			message.channel.send(embed);
		};


	},
};
