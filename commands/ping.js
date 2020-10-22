module.exports = {
	name: 'ping',
	description: 'Replies to your message, used to test latency',
  guildOnly: false,
  cooldown: 5,
  args: false,
  execute(message, args, client) {
		message.channel.send(`Pong! \`${Date.now() - message.createdTimestamp}ms\``);
	},
};
