const mentionParse = (mention, mentionType, validate, client, guild) => {
	
	if (mentionType === 'user') {
		if (mention.startsWith('<@') && mention.endsWith('>')) {
			mention = mention.slice(2, -1);
		};

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		};

		if (validate) {
			if (client.users.cache.has(mention)) {
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
			if (guild.members.cache.has(mention)) {
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
			if (client.channels.cache.has(mention)) {
				return mention;
			} else {
				return false;
			};
		} else {
			return mention;
		};
	};

	if (mentionType === 'role') {
		if (mention.startsWith(`<&`) && mention.endsWith('>')) {
			mention = mention.slice(2, -1);
		};

		if (validate) {
			if (!guild) return;
			if (guild.roles.cache.has(mention)) {
				return mention;
			} else {
				return false
			};
		} else {
			return mention;
		};
	};
};

module.exports = mentionParse;