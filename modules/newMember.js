const Discord = require('discord.js');
const db = require('quick.db');

const config = require('../config.json');

module.exports = {
	execute(client) {
		client.on('guildMemberAdd', member => {
			const verifiedRole = db.get(`${member.guild.id}.verifiedRole`) || false;
			const isVerified = db.get(`${member.user.id}.verified`) || false;

			if (isVerified && verifiedRole) {
				member.roles.add(verifiedRole, 'Verified in database')
					.catch((error) => {
						console.error(`Failed to add verifiedRole (${verifiedRole}) to ${member.user.username}#${member.user.tag} (${member.user.id})
                        * ${error}`);
					});

				// Message user
				const wbDMEmbed = new Discord.MessageEmbed()
					.setColor(config.theme.general)
					.setTitle(`👋 Welcome back`)
					.setDescription(`You're already verified and have access to the rest of the Discord`)
				member.user.send(wbDMEmbed)
					.catch((error) => {
						console.error(`Failed to send message to ${member.user.username}#${member.user.tag} (${member.user.id})
                        * ${error}`)
					});
			} else if (member.guild.id === config.mainGuild) {
				const embed = new Discord.MessageEmbed()
					.setColor('#fc54a0')
					.setTitle('👋 Welcome to the PPS Discord')
					.setDescription('Thanks for joining! Here\'s what you should do to get started...')
					.addFields(
						{ name: `📜 Read the Rules`, value: `We have some rules that we ask you to follow in this server. Check them out in <#776560396463112263>.`, inline: true },
						{ name: `✅ Verify`, value: `This server is only available to students & staff members of PPS. Send me your PPS email address to get started!`, inline: true },
						{ name: `💬 Chat with others`, value: `Talk in <#776662789916983298>, post memes in <#732828689435197462>, or even hop into a voice chat.`, inline: true },
						{ name: `⚙️ Change your Settings`, value: `Head over to <#776583195583447050> to set your pronouns, notification preferences, and more.`, inline: true },
					);
				member.user.send(embed)
					.catch((error) => {
						console.error(`Failed to send message to ${member.user.username}#${member.user.tag} (${member.user.id})
                        * ${error}`)
					});
			};
		});
	},
};