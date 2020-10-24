// Require discord.js, fs (Node.JS Filesystem), and config.json
const Discord = require('discord.js');
const fs = require('fs');
const { prefix, token, guildID, verifiedRole } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Requires every .js file in /commands
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// Requires modules
const welcome = require('./welcome.js');
const goodbye = require('./goodbye.js');

const cooldowns = new Discord.Collection();

// Once the bot is online, it logs that, then sets its status
// to "Listening to ${prefix}help" - dyanamically reads prefix from config.json
client.once('ready', () => {
	console.log('Naiden is Online!');

	// Run modules
	welcome.execute(client);
	goodbye.execute(client);

	client.user.setActivity(`${prefix}help`, { type: 'LISTENING' })
});

client.on('message', message => {
	// Check if message DOESN'T start with prefix, or if the message author is a bot.
	// If either are true, return.
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

// If the command is for use in-server only, return an error to the user
	if (command.guildOnly && message.channel.type === 'dm') {
		const embed = new Discord.MessageEmbed()
			.setColor('#f92921')
			.setTitle('Not here!')
			.setDescription(`That command cannot be used inside DMs`);
		return message.reply(embed);
	}

// If the command requires arguments && the message contains no arguments,
// return an error to the user
	if (command.args && !args.length) {
		const embed = new Discord.MessageEmbed()
			.setColor('#f92921')
			.setTitle('Incorrect Usage')
			.setDescription(`You didn't provide arguments`);
		return message.channel.send(embed);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			const embed = new Discord.MessageEmbed()
				.setColor('#f92921')
				.setTitle('Slow down!')
				.setDescription(`Wait ${timeLeft.toFixed(1)} second(s) before using \`${prefix}${command.name}\` again`);
			return message.channel.send(embed);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

// Attempts to execute the command from it's file - if it fails to do so,
// it catches the error, then tells the user to "bug [me] about it".
	try {
		command.execute(message, args, client);
	} catch (error) {
		console.error(error);
		const embed = new Discord.MessageEmbed()
			.setColor('#f92921')
			.setTitle('An error occured')
			.setDescription(`Go and bug <@302915598038335490> about it`);
		message.channel.send(embed)
	}
});

client.login(token);
