const Discord = require("discord.js");
const db = require("quick.db");

const mentionParse = require("../modules/mentionParse.js");

const config = require(`../config.json`);

module.exports = {
	enabled: true,
	hidden: true,
	name: "verify",
	description: "Verifies the specified member",
	guildOnly: true,
	mainGuildOnly: true,
	cooldown: 5,
	args: true,
	async execute(message, args, client) {
		if (message.member.roles.cache.has(config.adminRole)) {
			const userID = mentionParse.execute(args[0], "user");
			const user = client.users.resolve(userID);

			if (
				user &&
				/^[a-zA-Z0-9\.]+@(pps\.net|student\.pps\.net)$/.test(args[1])
			) {
				// Set associated keys in database
				db.delete(`${user.id}.code`);
				db.delete(`${user.id}.codeExpiration`);
				db.set(`${user.id}.verified`, true);
				db.set(`${user.id}.email`, args[1]);

				const embed = new Discord.MessageEmbed()
					.setColor(config.theme.successColor)
					.setTitle("✅ Success")
					.setDescription(`Verified <@${user.id}>
					**❗ Verification roles are not granted when done manually**`);
				return message.channel.send(embed);
			} else {
				const embed = new Discord.MessageEmbed()
					.setColor(config.theme.errorColor)
					.setTitle("❌ Incorrect Usage")
					.setDescription(
						`You didn't mention a valid user, or you specified an invalid email address`
					);
				return message.channel.send(embed);
			}
		} else {
			const embed = new Discord.MessageEmbed()
				.setColor(config.theme.errorColor)
				.setTitle("❌ Insufficent Permission")
				.setDescription(
					`That command requires the <@&${adminRole}> role`
				);
			return message.channel.send(embed);
		}
	},
};
