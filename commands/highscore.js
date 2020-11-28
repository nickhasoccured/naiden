const Discord = require("discord.js");
const db = require("quick.db");

const config = require("../config.json");

module.exports = {
	enabled: true,
	hidden: false,
	name: "highscore",
	description: "Shows the current High Score of the server",
	usage: "",
	aliases: ["hscore"],
	cooldown: 5,
	args: false,
	guildOnly: true,
	mainGuildOnly: false,
	execute(message, args, client) {
		const highscore = db.get(`${message.guild.id}.countingHighScore`) || 0;
		const embed = new Discord.MessageEmbed()
			.setTitle(`🏆 The current counting High Score is **${highscore}**!`)
			.setColor(config.theme.successColor);
		message.channel.send(embed);
	},
};
