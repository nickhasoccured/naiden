const Discord = require("discord.js");

const config = require("../config.json");

module.exports = {
	enabled: true,
	hidden: false,
	name: "ping",
	description: "Test latency of bot",
	usage: "",
	aliases: ["pong"],
	cooldown: 5,
	args: false,
	guildOnly: false,
	mainGuildOnly: false,
	execute(message, args, client) {
		const embed = new Discord.MessageEmbed()
			.setColor(config.theme.successColor)
			.setTitle("Pong!")
			.setDescription(
				`It took \`${
					Date.now() - message.createdTimestamp
				}ms\` for your message to reach me.`
			);
		return message.channel.send(embed);
	},
};
