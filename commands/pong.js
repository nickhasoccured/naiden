module.exports = {
	name: 'pong',
	description: 'Replies with "Ping!", used to test latency',
	guildOnly: false,
	cooldown: 5,
	args: false,
	execute(message, args, client) {
		message.channel.send(`Ping! \`${Date.now() - message.createdTimestamp}ms\``);
	},
};
