const Discord = require('discord.js');
const Keyv = require('keyv');
const { adminRole, verifiedRole } = require(`../config.json`);

// Configuration for Keyv (database)
const keyv = new Keyv('sqlite://database.sqlite');
keyv.on('error', err => console.error('Keyv connection error:', err));

module.exports = {
	name: 'verify',
	description: 'Verifies the specified member',
  guildOnly: true,
  cooldown: 5,
  args: true,
  async execute(message, args, client) {

		// Permissions & checking arguments
		if (message.member.roles.cache.has(adminRole)) {
			if ( /^[a-zA-Z0-9\.]+@(pps.net|student.pps.net)$/.test(args[1]) ) {

				// If user had a code, delete it
				if (await keyv.get(`${args[0]}_code`)) {
					await keyv.delete(`${args[0]}_code`);
				};

				// Set associated keys in database
				await keyv.set(`${args[0]}_isVerified`, true);
				await keyv.set(`${args[0]}_email`, args[1]);
				await keyv.set(`${args[1]}_taken`, true);

				const embed = new Discord.MessageEmbed()
        	.setColor('#16c60c')
        	.setTitle('✅ Success')
        	.setDescription(`Verified <@${args[0]}>\n**❗ Remember to give them the required roles**`);
        message.channel.send(embed);
			} else {
				const embed = new Discord.MessageEmbed()
        	.setColor('#f92921')
        	.setTitle('❌ An error occured')
        	.setDescription(`The second argument is not a valid PPS email`);
        message.channel.send(embed);
			}
		} else {
			const embed = new Discord.MessageEmbed()
      	.setColor('#f92921')
      	.setTitle('❌ Insufficent Permission')
      	.setDescription(`That command requires the <@&${adminRole}> role`);
      message.channel.send(embed);
		};

	},
};
