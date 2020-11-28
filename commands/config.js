const Discord = require("discord.js");
const db = require("quick.db");

const config = require("../config.json");

const validSettings = [
	"verifiedRole",
	"welcomeChannel",
	"countingChannel",
	"autoVoiceLobby",
	"autoVoiceTemplate",
	"autoVoiceCategory",
];

module.exports = {
	enabled: true,
	hidden: false,
	name: "config",
	description: "Change settings for the current server",
	usage: "[setting] <value>",
	aliases: ["settings", "setting"],
	cooldown: 10,
	args: false,
	guildOnly: true,
	execute(message, args, client) {
		// Check that the user has the MANAGE_GUILD permission
		if (message.member.hasPermission("MANAGE_GUILD")) {
			let guildConfig = db.get(message.guild.id) || {};
			const currentValidSettings = validSettings.filter(
				(setting) => setting === args[0]
			);

			for (const setting of validSettings) {
				if (!(setting in guildConfig)) {
					db.set(`${message.guild.id}.${setting}`, false);
				}
			}

			guildConfig = db.get(message.guild.id);

			// Embed template (changes based on result)
			const embed = new Discord.MessageEmbed()
				.setColor(config.theme.successColor)
				.setTitle("⚙️ Server Configuration")
				.setDescription(
					`Use \`${config.prefix}config [setting] [value]\` to configure a setting, arguments are case sensitive!
					
					▫️ \`verifiedRole = ${guildConfig.verifiedRole}\` - ID of the verification role for this server, or \`false\`
					▫️ \`welcomeChannel = ${guildConfig.welcomeChannel}\` - ID of the channel which welcome messages are sent, or \`false\`
					▫️ \`countingChannel = ${guildConfig.countingChannel}\` - ID of the channel where the counting game takes place, or \`false\`
					▫️ \`autoVoiceLobby = ${guildConfig.autoVoiceLobby}\` - ID of the voice channel users join to create a new voice room, or \`false\`
					▫️ \`autoVoiceTemplate = ${guildConfig.autoVoiceTemplate}\` - ID of the voice channel to clone for new rooms, or \`false\`
					▫️ \`autoVoiceCategory = ${guildConfig.autoVoiceCategory}\` - ID of the category for new voice rooms, or \`false\``
				);
			// If there are arguments
			if (args.length) {
				// If the first argument is valid & the second argument exists
				if (currentValidSettings.length && args[1]) {
					db.set(`${message.guild.id}.${args[0]}`, args[1]);
					guildConfig = db.get(message.guild.id);

					embed.setTitle("✅ Success");
					embed.setDescription(
						`Changed setting for this server.
						Use \`${config.prefix}config [setting] [value]\` to configure a setting, arguments are case sensitive!
					
						▫️ \`${args[0]} = ${args[1]}\``
					);
					embed.setColor(config.theme.successColor);
					message.channel.send(embed);
				} else {
					embed.setColor(config.theme.errorColor);
					message.channel.send(embed);
				}
			} else {
				embed.setColor(config.theme.successColor);
				message.channel.send(embed);
			}
			// Permission error
		} else {
			const embed = new Discord.MessageEmbed()
				.setColor(config.theme.errorColor)
				.setTitle("❌ Insufficent Permission")
				.setDescription(
					`That command requires the \`Manage Guild\` permission`
				);
			message.channel.send(embed);
		}
	},
};
