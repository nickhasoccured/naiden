const Discord = require('discord.js');
const { adminRole } = require ('../config.json');

module.exports = {
	name: 'setstatus',
	description: 'Sets the status of the bot.',
	aliases: ['setactivity'],
  guildOnly: true,
  args: true,
	usage: '[command name] [status type] [status string]',
	cooldown: 5,
	execute(message, args, client) {
		// Permissions
    if (message.member.roles.cache.has(adminRole)) {
			args[0] = args[0].toUpperCase();
      if (args[0] === 'PLAYING' || args[0] === 'WATCHING' || args[0] === 'LISTENING' || args[0] === 'COMPETING') {

				const activityType = args[0].toUpperCase();

				// Remove first argument (activityType) so that rest of array is activityString
				args.splice(0, 1);
        const activityString = args.join(' ');

				// Set activity, send message
	      client.user.setActivity(activityString, { type: activityType });
				const embed = new Discord.MessageEmbed()
        	.setColor('#16c60c')
        	.setTitle('✅ Success')
        	.setDescription(`Updated status`);
        message.channel.send(embed);

      } else {
        const embed = new Discord.MessageEmbed()
        	.setColor('#f92921')
        	.setTitle('An error occured')
        	.setDescription(`You didn't provide [a valid activity](https://hastebin.com/raw/vepepegowi) as the first argument`);
        message.channel.send(embed);
      };
    } else {
			const embed = new Discord.MessageEmbed()
      	.setColor('#f92921')
      	.setTitle('Insufficent Permission')
      	.setDescription(`That command requires the <@&${adminRole}> role`);
      message.channel.send(embed);
		};


	},
};
