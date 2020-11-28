const Discord = require("discord.js");
const db = require("quick.db");

const config = require("../config.json");

module.exports = {
	name: "newMember",
	startup: true,
	execute(client) {
		client.on("guildMemberAdd", (member) => {
			const verifiedRole =
				db.get(`${member.guild.id}.verifiedRole`) || false;
			const isVerified = db.get(`${member.user.id}.verified`) || false;

			if (isVerified && verifiedRole) {
				member.roles
					.add(verifiedRole, "User is already verified")
					.then((result) => {
						// Message user
						const welcomeBackDM = new Discord.MessageEmbed()
							.setColor(config.theme.generalColor)
							.setTitle(`👋 Welcome back`)
							.setDescription(
								`You're already verified and have access to the rest of the Discord`
							);
						member.user.send(welcomeBackDM).catch((error) => {
							console.error(`Failed to send message to ${member.user.username}#${member.user.tag} (${member.user.id})
					* ${error}`);
						});

						const channel = client.channels.resolve(
							db.get(`${member.guild.id}.welcomeChannel`)
						);
						if (!channel) return;

						const welcomeBackMessage = new Discord.MessageEmbed()
							.setTitle(`👋 Welcome back, ${member.displayName}`)
							.setColor(config.theme.generalColor);

						return channel
							.send(welcomeBackMessage)
							.catch((error) => {
								console.error(`Failed to send message in #${channel.name} (${channel.id}) in ${channel.guild.name} (${channel.guild.id})
						* ${error}`);
							});
					})
					.catch((error) => {
						const verificationErrorEmbed = new Discord.MessageEmbed()
							.setTitle("❌ An error occured")
							.setColor(config.theme.errorColor)
							.setDescription(
								"Failed to give you verification roles, contact an administrator about this issue"
							);
						member.user.send(verificationErrorEmbed);
						return console.error(`Failed to add verifiedRole (${verifiedRole}) to ${member.user.username}#${member.user.tag} (${member.user.id})
                        * ${error}`);
					});
			} else if (member.guild.id === config.mainGuild) {
				const embed = new Discord.MessageEmbed()
					.setColor(config.theme.generalColor)
					.setTitle("👋 Welcome to the PPS Discord")
					.setDescription(
						"Thanks for joining! Here's what you should do to get started..."
					)
					.addFields(
						{
							name: `📜 Read the Rules`,
							value: `We have some rules that we ask you to follow in this server. Check them out in <#776560396463112263>.`,
							inline: true,
						},
						{
							name: `✅ Verify`,
							value: `This server is only available to students & staff members of PPS. Send me your PPS email address to get started!`,
							inline: true,
						},
						{
							name: `💬 Chat with others`,
							value: `Talk in <#776662789916983298>, post memes in <#732828689435197462>, or even hop into a voice chat.`,
							inline: true,
						},
						{
							name: `⚙️ Change your Settings`,
							value: `Head over to <#776583195583447050> to set your pronouns, notification preferences, and more.`,
							inline: true,
						}
					);
				member.user.send(embed).catch((error) => {
					console.error(`Failed to send message to ${member.user.username}#${member.user.tag} (${member.user.id})
                        * ${error}`);
				});
			}
		});
	},
};
