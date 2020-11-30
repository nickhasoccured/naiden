const Discord = require("discord.js");

const mentionParse = require("../modules/mentionParse.js");

const config = require("../config.json");

module.exports = {
	enabled: true,
	hidden: true,
	name: "message",
	description: "Message a user",
	usage: "[user] [message]",
	aliases: ["dm"],
	cooldown: 7,
	args: true,
	guildOnly: true,
	mainGuildOnly: true,
	execute(message, args, client) {
		if (message.member.roles.cache.has(config.adminRole)) {
			const mention = mentionParse.execute(args[0], "user");
			const user = client.users.resolve(mention);

			if (user) {
				args.splice(0, 1);
				const messageString = args.join(" ");

				user.send(messageString)
					.then((result) => {
						const successEmbed = new Discord.MessageEmbed()
							.setColor(config.theme.successColor)
							.setTitle("✅ Success")
							.setDescription(`Sent message to <@${mention}>`);
						return message.channel.send(successEmbed);
					})
					.catch((error) => {
						const messageErrorEmbed = new Discord.MessageEmbed()
							.setColor(config.theme.errorColor)
							.setTitle("❌ An error occured")
							.setDescription(
								`Failed to send message to <@${mention}>, they may have DMs disabled, or have blocked Naiden`
							);
						return message.channel.send(messageErrorEmbed);
					});
			} else {
				const mentionFailEmbed = new Discord.MessageEmbed()
					.setColor(config.theme.errorColor)
					.setTitle("❌ An error occured")
					.setDescription(
						`You didn't mention a valid user, or it was invalid`
					);
				return message.channel.send(mentionFailEmbed);
			}
		} else {
			const noPermissionEmbed = new Discord.MessageEmbed()
				.setColor(config.theme.errorColor)
				.setTitle("❌ Insufficent Permission")
				.setDescription(
					`Contact an administrator if you believe this is an error`
				);
			return message.channel.send(noPermissionEmbed);
		}
	},
};
