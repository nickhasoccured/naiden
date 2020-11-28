const Discord = require("discord.js");
const db = require("quick.db");

const mentionParse = require("../modules/mentionParse.js");

const config = require("../config.json");

module.exports = {
	enabled: true,
	hidden: true,
	name: "deverify",
	description: "Removes verification from the specified user",
	guildOnly: true,
	mainGuildOnly: true,
	cooldown: 5,
	args: true,
	execute(message, args, client) {
		if (message.member.roles.cache.has(config.adminRole)) {
			const userID = mentionParse.execute(args[0], "user", false);
			const isVerified = db.get(`${userID}.verified`);
			if (isVerified) {
				db.delete(`${args[0]}.email`);
				db.delete(`${args[0]}.verified`);

				const embed = new Discord.MessageEmbed()
					.setColor(config.theme.successColor)
					.setTitle("✅ Success")
					.setDescription(`Removed verification records for <@${userID}>
					**❗ Verification roles are not removed when done manually**`);
				message.channel.send(embed);
			} else {
				const embed = new Discord.MessageEmbed()
					.setColor(config.theme.errorColor)
					.setTitle("❌ An error occured")
					.setDescription(
						`That user isn't verified, or your mention is invalid`
					);
				message.channel.send(embed);
			}
		} else {
			const embed = new Discord.MessageEmbed()
				.setColor(config.theme.errorColor)
				.setTitle("❌ Insufficent Permission")
				.setDescription(
					`That command requires the <@&${config.adminRole}> role`
				);
			message.channel.send(embed);
		}
	},
};
