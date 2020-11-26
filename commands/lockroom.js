const Discord = require('discord.js')
const db = require('quick.db');

const config = require('../config.json');

module.exports = {
	"enabled": false,
	name: 'lockroom',
	description: 'Locks/Unlocks your current voice room',
	usage: '',
	aliases: ['unlockroom'],
	cooldown: 5,
	args: false,
	guildOnly: true,
	mainGuildOnly: false,
	async execute(message, args, client) {
		let guildLobbyChannel = db.get(`${guild.id}.autoVoiceLobby`) || false;
		let guildTemplateChannel = db.get(`${guild.id}.autoVoiceTemplate`) || false;
		let guildVoiceCategory = db.get(`${guild.id}.autoVoiceCategory`) || false;

		if (!(guildLobbyChannel) || !(guildTemplateChannel) || !(guildVoiceCategory)) return message.channel.send(errorEmbed);

		guildLobbyChannel = await client.channels.fetch(guildLobbyChannel)
			.then((result) => {
				if (result.type === 'voice') return result;
			})
			.catch((error) => {
				console.log((`Failed to fetch channel (${guildLobbyChannel}) in server ${guild.name} (${guild.id})
                    * ${error}`));
			});

		guildTemplateChannel = await client.channels.fetch(guildTemplateChannel)
			.then((result) => {
				if (result.type === 'voice') return result;
			})
			.catch((error) => {
				console.log((`Failed to fetch channel (${guildTemplateChannel}) in server ${guild.name} (${guild.id})
                    * ${error}`));
			});

		guildVoiceCategory = await client.channels.fetch(guildVoiceCategory)
			.then((result) => {
				if (result.type === 'category') return result;
			})
			.catch((error) => {
				console.log((`Failed to fetch channel (${guildVoiceCategory}) in server ${guild.name} (${guild.id})
                    * ${error}`));
			});

		if (!(guildLobbyChannel) || !(guildTemplateChannel) || !(guildVoiceCategory)) return message.channel.send(errorEmbed);

		const errorEmbed = new Discord.MessageEmbed()
			.setTitle('❌ An error occured')
			.setColor(config.theme.errorColor)
			.setDescription('Your not in a room, the room doesn\'t belong to you, or this server doesn\'t support rooms');

		if (message.member.voice.channel) {
			const currentRoomOwner = db.get(`${message.member.voice.channel.id}.owner`);
			const isRoomLocked = db.get(`${message.member.voice.channel.id}.locked`);

			if (currentRoomOwner === message.author.id) {
				message.member.voice.channel.permissionOverwrites.each(overwrite => {
					if (isRoomLocked) {
						
					} else {

					};
				});
			} else {
				return message.channel.send(errorEmbed);
			};
		} else {
			return message.channel.send(errorEmbed);
		};
	},
};
