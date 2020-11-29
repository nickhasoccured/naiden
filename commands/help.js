const Discord = require("discord.js");
const db = require("quick.db");

const config = require("../config.json");

module.exports = {
	enabled: true,
	hidden: false,
	name: "help",
	description: "Shows a list of all commands",
	usage: "<command>",
	aliases: ["commands"],
	cooldown: 5,
	args: false,
	guildOnly: false,
	mainGuildOnly: false,
	execute(message, args, client) {
		if (args.length) {
			const commandName = args[0].toLowerCase();
			const command =
				client.commands.get(commandName) ||
				client.commands.find(
					(command) =>
						command.aliases && command.aliases.includes(commandName)
				);

			if (!command || command.disabled) {
				const noCommandEmbed = new Discord.MessageEmbed()
					.setTitle(`❌ That command doesn't exist or it's disabled`)
					.setColor(config.theme.errorColor)
					.setDescription(
						"Contact an administrator if this is an error"
					);
				return message.channel.send(noCommandEmbed);
			}

			let description = `▫️ **DESCRIPTION**: ${command.description}`;

			if (command.usage) {
				description += `\n▫️ **USAGE**: \`${config.prefix}${command.name} ${command.usage}\``;
			}

			if (command.aliases.length) {
				let formattedAliases = [];
				command.aliases.forEach((alias) => {
					formattedAliases.push(`\`${config.prefix}${alias}\``);
				});

				description =
					description +
					`\n▫️ **ALIASES**: ${formattedAliases.join(", ")}`;
			}

			if (command.mainGuildOnly) {
				description =
					"**❗ This command can only be used inside the main PPS server**\n\n" +
					description;
			} else if (command.guildOnly) {
				description =
					"**❗ This command can only be used inside servers**\n\n" +
					description;
			}

			const commandEmbed = new Discord.MessageEmbed()
				.setTitle(`Help for \`${config.prefix}${command.name}\``)
				.setColor(config.theme.successColor)
				.setDescription(description);

			return message.channel.send(commandEmbed);
		} else {
			let commandList;

			client.commands.each((command) => {
				if (command.enabled && !command.hidden) {
					commandList += `\n${config.prefix}${command.name} ${command.usage}`;
				}
			});

			const commandsEmbed = new Discord.MessageEmbed()
				.setTitle(`Help`)
				.setColor(config.theme.successColor)
				.setDescription(`Here's a list of all commands you can use. Arguments in \`[]\` are required, while arguments in \`<>\` are optional. You can also use \`${config.prefix}help <command>\` to get help for a specific command.
				
				\`\`\`${commandList}\`\`\``);

			return message.channel.send(commandsEmbed);
		}
	},
};
