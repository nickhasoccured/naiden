const Discord = require("discord.js");
const db = require("quick.db");

const config = require("../config.json");

module.exports = {
	enabled: true,
	hidden: false,
	name: "nextnumber",
	description: "Says the next number for the server",
	usage: "",
	aliases: ["nextnum"],
	cooldown: 5,
	args: false,
	guildOnly: true,
	mainGuildOnly: false,
	execute(message, args, client) {
		const currentNumber = db.get(`${message.guild.id}.countingNumber`) || 0;
		const nextNum = currentNumber + 1;
		const embed = new Discord.MessageEmbed()
			.setTitle(`The next counting number is **${nextNum}**`)
			.setColor(config.theme.successColor);
		message.channel.send(embed);
	},
};
