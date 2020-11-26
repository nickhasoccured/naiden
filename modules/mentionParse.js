module.exports = {
	"name": "mentionParse",
	"startup": false,
	async execute(mention, mentionType, validate = false, client, guild) {
		if (!(mention) || !(mentionType)) return;

		if (mentionType === 'user') {
			if (mention.startsWith('<@') && mention.endsWith('>')) {
				mention = mention.slice(2, -1);
			};

			if (mention.startsWith('!')) {
				mention = mention.slice(1);
			};

			if (validate) {
				const user = await client.users.fetch(mention)
					.then((result) => {
						return result;
					})
					.catch((error) => {
						console.error(`Failed to fetch user ${mention}
						* ${error}`);
						return false;
					});

				if (user) {
					return mention;
				} else {
					return false;
				};
			} else {
				return mention;
			};
		};

		if (mentionType === 'member') {
			if (mention.startsWith('<@') && mention.endsWith('>')) {
				mention = mention.slice(2, -1);
			};

			if (mention.startsWith('!')) {
				mention = mention.slice(1);
			};

			if (validate) {
				if (!guild) return;

				const member = await guild.members.fetch(mention)
					.then((result) => {
						return result;
					})
					.catch((error) => {
						console.error(`Failed to fetch member ${mention}
						* ${error}`);
						return false;
					});

				if (member) {
					return mention;
				} else {
					return false;
				};
			} else {
				return mention;
			};
		};

		if (mentionType === 'channel') {
			if (mention.startsWith('<#') && mention.endsWith('>')) {
				mention = mention.slice(2, -1);
			};

			if (validate) {
				if (!client) return;

				const channel = await client.channels.fetch(mention)
					.then((result) => {
						return result;
					})
					.catch((error) => {
						console.error(`Failed to fetch channel ${mention}
						* ${error}`);
						return false;
					});

				if (channel) {
					return mention;
				} else {
					return false;
				};
			} else {
				return mention;
			};
		};

		if (mentionType === 'role') {
			if (mention.startsWith('<@&') && mention.endsWith('>')) {
				mention = mention.slice(3, -1);
			};

			if (validate) {
				if (!guild) return;

				const role = await guild.roles.fetch(mention)
					.then((result) => {
						return result;
					})
					.catch((error) => {
						console.error(`Failed to fetch role ${mention}
						* ${error}`);
						return false;
					});

				if (role) {
					return mention;
				} else {
					return false;
				};
			} else {
				return mention;
			};
		};
	},
};