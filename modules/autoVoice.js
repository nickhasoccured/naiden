const Discord = require('discord.js');
const db = require('quick.db');

const possesiveFormOf = (string) => {
    if (!string) return;
    if (string.toLowerCase().endsWith('s')) {
        return `${string}'`
    } else {
        return `${string}'s`
    };
};

module.exports = {
    "name": "autoVoice",
    "startup": false,
    execute(client) {
        client.on('voiceStateUpdate', async (oldState, newState) => {
            const guild = newState.guild;
            if (!(db.get(`${guild.id}.autoVoiceLobby`)) || !(db.get(`${guild.id}.autoVoiceTemplate`)) || !(db.get(`${guild.id}.autoVoiceCategory`))) return;

            let guildLobbyChannel = db.get(`${guild.id}.autoVoiceLobby`) || false;
            let guildTemplateChannel = db.get(`${guild.id}.autoVoiceTemplate`) || false;
            let guildVoiceCategory = db.get(`${guild.id}.autoVoiceCategory`) || false;

            if (!(guildLobbyChannel) || !(guildTemplateChannel) || !(guildVoiceCategory)) return;

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

            if (oldState.channel) {
                if (oldState.channel.parent) {
                    if (oldState.channel.parent.id === guildVoiceCategory.id) {
                        if ((oldState.channel.id !== guildLobbyChannel.id) && (oldState.channel.id !== guildTemplateChannel.id) && !(oldState.channel.members.size)) {
                            db.delete(oldState.channel.id);
                            oldState.channel.delete('Empty room')
                                .catch((error) => {
                                    console.log(`Failed to delete channel ${oldState.channel.name} (${oldState.channel.id}) in server ${oldState.channel.guild.name} (${oldState.channel.guild.id})
                                * ${error}`);
                                });
                        };
                    };
                };
            };

            if (newState.channel) {
                if (newState.channel.id === guildLobbyChannel.id) {
                    guildLobbyChannel.clone({
                        "name": `💬 ${possesiveFormOf(newState.member.displayName)} Room`,
                        "type": "voice",
                        "parent": guildVoiceCategory.id,
                        "reason": `${newState.member.user.tag} created a new room`
                    })
                    .then((result) => {
                        db.set(`${result.id}.owner`, newState.member.user.id);
                        newState.setChannel(result, `${newState.member.displayName} created a new room`);
                    })
                    .catch((error) => {
                        console.error(`Failed to clone channel ${guildLobbyChannel.name} (${guildLobbyChannel.id}) in server ${guild.name} (${guild.id})
                        * ${error}`);
                    });
                };
            };
        });
    },
};