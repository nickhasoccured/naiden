const Discord = require('discord.js');
const db = require('quick.db');

const config = require('../config.json');

const lastUser = new Discord.Collection();

module.exports = {
    execute(client) {
        client.on('message', message => {
            if (message.channel.type !== 'text') return;
            if (!/^\d.*$/.test(message.content.trim())) return;

            if (lastUser.get(message.guild.id) == message.author.id) return;
            lastUser.set(message.guild.id, message.author.id);

            const guildCountChannel = db.get(`${message.guild.id}.countingChannel`) || false;
            if (!guildCountChannel) return;
            if (message.channel.id !== guildCountChannel) return;

            const currentNumber = db.get(`${message.guild.id}.countingNumber`) || 0;
            const expectedNumber = currentNumber + 1;

            const highScore = db.get(`${message.guild.id}.countingHighScore`) || 0;

            if (message.content.trim().startsWith(expectedNumber)) {
                let reactionEmoji;
                if (expectedNumber > highScore) {
                    reactionEmoji = '🏆';
                } else {
                    reactionEmoji = '✅';
                };

                message.react(reactionEmoji)
                    .catch((error) => {
                        return console.log(`Failed to react to message in ${message.guild.name} (${message.guild.id})
                    * ${error}`);
                    })
                    .then((result) => {
                        db.add(`${message.guild.id}.countingNumber`, 1);
                        if (expectedNumber > highScore) {
                            db.set(`${message.guild.id}.countingHighScore`, expectedNumber);
                        };
                    });
            } else {
                message.react('❌')
                    .catch((error) => {
                        console.log(`Failed to react to message in ${message.guild.name} (${message.guild.id})
                        * ${error}`);
                    });

                db.set(`${message.guild.id}.countingNumber`, 0);
                lastUser.delete(message.guild.id);

                const failEmbed = new Discord.MessageEmbed()
                    .setTitle(`${message.member.displayName} failed at ${currentNumber}`)
                    .setColor(config.theme.errorColor)
                    .setDescription(`The expected number was ${expectedNumber}, now you have to start from 0!`);
                message.channel.send(`<@${message.author.id}>`, failEmbed)
                    .catch((error) => {
                        console.error(`Failed to send message in #${channel.name} (${channel.id}) in ${channel.guild.name} (${channel.guild.id})
                        * ${error}`);
                    });
            };
        });

        client.on('messageDelete', message => {
            if (message.channel.type !== 'text') return;

            const guildCountChannel = db.get(`${message.guild.id}.countingChannel`) || false;
            if (!guildCountChannel) return;

            const currentNumber = db.get(`${message.guild.id}.countingNumber`);
            const expectedNumber = currentNumber + 1;

            const deletionEmbed = new Discord.MessageEmbed()
                .setTitle(`❗ Message Deleted`)
                .setColor(config.theme.pendingColor)
                .setDescription(`The next number is ${expectedNumber}`);
            message.channel.send(deletionEmbed)
                .catch((error) => {
                    console.error(`Failed to send message in #${channel.name} (${channel.id}) in ${channel.guild.name} (${channel.guild.id})
                * ${error}`);
                });
        });
    },
};