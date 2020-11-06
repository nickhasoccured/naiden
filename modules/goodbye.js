const Discord = require('discord.js');
const Keyv = require('keyv');
const { welcomeChannel } = require('../config.json');

// Configuration for Keyv (database)
const keyv = new Keyv('sqlite://database.sqlite');
keyv.on('error', err => console.error('Keyv connection error:', err));

module.exports = {
  execute (client) {

    client.on('guildMemberRemove', async member => {
      // Check if user was verified
      // Doesn't notify if the user wasn't verified
      if ( await keyv.get(`${member.user.id}_isVerified`) ) {
        const embed = new Discord.MessageEmbed()
          .setColor('#f92921')
          .setTitle(`👋 Goodbye, ${member.user.username}`);
        const channel = client.channels.cache.get(welcomeChannel);
        channel.send(embed);
      };
    });
  }
};
