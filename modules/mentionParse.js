module.exports = {
	name: "mentionParse",
	startup: false,
	execute(mention, mentionType) {
		if (!mention || !mentionType) return;

		if (mentionType === "user") {
			if (mention.startsWith("<@") && mention.endsWith(">")) {
				mention = mention.slice(2, -1);
			}

			if (mention.startsWith("!")) {
				mention = mention.slice(1);
			}

			return mention;
		}

		if (mentionType === "member") {
			if (mention.startsWith("<@") && mention.endsWith(">")) {
				mention = mention.slice(2, -1);
			}

			if (mention.startsWith("!")) {
				mention = mention.slice(1);
			}

			return mention;
		}

		if (mentionType === "channel") {
			if (mention.startsWith("<#") && mention.endsWith(">")) {
				mention = mention.slice(2, -1);
			}

			return mention;
		}

		if (mentionType === "role") {
			if (mention.startsWith("<@&") && mention.endsWith(">")) {
				mention = mention.slice(3, -1);
			}

			return mention;
		}
	},
};
