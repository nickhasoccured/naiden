const Discord = require("discord.js");
const db = require("quick.db");

const mentionParse = require("../modules/mentionParse.js");

const config = require("../config.json");

module.exports = {
	enabled: true,
	hidden: false,
	name: "refreshverify",
	description: "Refresh verification roles for someone",
	usage: "<member>",
	aliases: ["verifyrefresh"],
	cooldown: 10,
	args: false,
	guildOnly: true,
	mainGuildOnly: false,
	execute(message, args, client) {
		const verifiedRole = db.get(`${message.guild.id}.verifiedRole`);
		if (!verifiedRole) {
			const verificationDisabledEmbed = new Discord.MessageEmbed()
				.setColor(config.theme.errorColor)
				.setTitle("❌ Not here")
				.setDescription(
					`This server doesn't have the verification system enabled, contact an administrator if this is an error`
				);
			return message.channel.send(verificationDisabledEmbed);
		}

		let member;
		if (args[0]) {
			const userID = mentionParse.execute(args[0], "user");
			member = message.guild.members.resolve(userID);

			if (!member) {
				const mentionFailEmbed = new Discord.MessageEmbed()
					.setColor(config.theme.errorColor)
					.setTitle("❌ Incorrect Usage")
					.setDescription(
						`The member you specified isn't in this server, or your mention is invalid.`
					);
				return message.channel.send(mentionFailEmbed);
			}
		} else {
			member = message.member;
		}

		const isVerified = db.get(`${member.user.id}.verified`);
		if (isVerified) {
			if (!member.roles.cache.has(verifiedRole)) {
				member.roles
					.add(verifiedRole)
					.then((result) => {
						const embed = new Discord.MessageEmbed()
							.setColor(config.theme.successColor)
							.setTitle("✅ Success")
							.setDescription(
								`<@${member.user.id}> has been given verification roles`
							);
						return message.channel.send(embed);
					})
					.catch((error) => {
						console.error(`Failed to add verifiedRole (${verifiedRole}) to ${member.user.tag} (${member.user.id}) in server ${member.guild.name} (${member.guild.id})
						* ${error}`);
						const roleFailEmbed = new Discord.MessageEmbed()
							.setColor(config.theme.errorColor)
							.setTitle("❌ An error occured")
							.setDescription(
								`Couldn't add verification role to <@${member.user.id}>, contact an administrator about this issue`
							);
						return message.channel.send(roleFailEmbed);
					});
			} else {
				const embed = new Discord.MessageEmbed()
					.setColor(config.theme.pendingColor)
					.setTitle("👍 Success")
					.setDescription(
						`<@${member.user.id}> is already verified, nothing changed`
					);
				return message.channel.send(embed);
			}
		} else {
			const notVerifiedEmbed = new Discord.MessageEmbed()
				.setColor(config.theme.errorColor)
				.setTitle("❌ An error occured")
				.setDescription(`That user isn't verified, nothing changed`);
			return message.channel.send(notVerifiedEmbed);
		}
	},
};
