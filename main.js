// Require discord.js, fs (Node.JS Filesystem), and config.json
const Discord = require('discord.js');
const fs = require('fs');

const config = require('./config.json');

const client = new Discord.Client({
	"presence": {
		"activity": {
			"name": `${config.prefix}help`,
			"type": "LISTENING"
		}
	}
});

client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const moduleFiles = fs.readdirSync('./modules').filter(file => file.endsWith('.js'));

// Requires every .js file in /commands
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
};

const cooldowns = new Discord.Collection();

// Once the bot is online, it logs that, then sets its status
// to "Listening to ${prefix}help" - dyanamically reads prefix from config.json
client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}`);

	// Execute modules
	for (const file of moduleFiles) {
		const module = require(`./modules/${file}`);
		if (module.startup === true) {
			module.execute(client);
			console.log(`Started ${module.name} module`);
		};
	};
});

client.on('message', message => {
	// Check if message DOESN'T start with prefix, or if the message author is a bot.
	// If either are true, return.
	if (!message.content.startsWith(config.prefix) || message.author.bot) return;

	const args = message.content.slice(config.prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (!command.enabled) {
		const disabledEmbed = new Discord.MessageEmbed()
			.setTitle("❌ That command is disabled")
			.setColor(config.theme.errorColor)
			.setDescription(`\`${config.prefix}${command.name}\` is disabled! Contact an administrator if you believe this is an error`);
		return message.channel.send(disabledEmbed)
			.catch((error) => {
				console.error(`Failed to send message in #${channel.name} (${channel.id}) in ${channel.guild.name} (${channel.guild.id})
			* ${error}`);
			});
	};

	// If the command is for use in-server only, return an error to the user
	if (command.guildOnly && message.channel.type !== 'text') {
		const embed = new Discord.MessageEmbed()
			.setColor(config.theme.errorColor)
			.setTitle("❌ Not here")
			.setDescription(`\`${config.prefix}${command.name}\` can only be used inside servers`);
		return message.channel.send(embed)
			.catch((error) => {
				console.error(`Failed to send message in #${channel.name} (${channel.id}) in ${channel.guild.name} (${channel.guild.id})
				* ${error}`);
			});
	};

	if (command.mainGuildOnly && message.guild.id !== config.mainGuild) {
		const embed = new Discord.MessageEmbed()
			.setColor(config.theme.errorColor)
			.setTitle("❌ Not here")
			.setDescription(`\`${config.prefix}${command.name}\` can only be used inside the main PPS server`);
		return message.channel.send(embed)
			.catch((error) => {
				console.error(`Failed to send message in #${channel.name} (${channel.id}) in ${channel.guild.name} (${channel.guild.id})
				* ${error}`);
			});
	};

	// If the command requires arguments && the message contains no arguments,
	// return an error to the user
	if (command.args && !args.length) {
		const embed = new Discord.MessageEmbed()
			.setColor(config.theme.errorColor)
			.setTitle("❌ Incorrect Usage")
			.setDescription("You didn't provide any arguments");
		return message.channel.send(embed)
			.catch((error) => {
				console.error(`Failed to send message in #${channel.name} (${channel.id}) in ${channel.guild.name} (${channel.guild.id})
				* ${error}`);
			});
	};

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	};

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			const embed = new Discord.MessageEmbed()
				.setColor(config.theme.errorColor)
				.setTitle("🛑 Slow down")
				.setDescription(`Wait ${timeLeft.toFixed(0)} second(s) before using \`${config.prefix}${command.name}\` again`);
			return message.channel.send(embed)
				.catch((error) => {
					console.error(`Failed to send message in #${channel.name} (${channel.id}) in ${channel.guild.name} (${channel.guild.id})
					* ${error}`);
				});
		};
	};

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	// Attempts to execute the command from it's file - if it fails to do so,
	// it catches the error, then tells the user to "bug [me] about it".
	try {
		command.execute(message, args, client);
	} catch (error) {
		console.error(`Failed to execute command ${command.name} for user ${message.author.tag} (${message.author.id})
		* ${error}`);
		const errorEmbed = new Discord.MessageEmbed()
			.setColor(config.theme.errorColor)
			.setTitle("❌ An error occured")
			.setDescription("Contact an administrator about this issue");
		message.channel.send(errorEmbed)
			.catch((error) => {
				console.error(`Failed to send message in #${channel.name} (${channel.id}) in ${channel.guild.name} (${channel.guild.id})
				* ${error}`);
			});
	};
});

client.login(config.token);