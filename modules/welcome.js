const Discord = require('discord.js');
const Keyv = require('keyv');
const nodemailer = require('nodemailer');
const { guildID, verifiedRole, welcomeChannel, emailUsername, emailPassword, adminRole } = require('../config.json');

// Configuration for Keyv (database)
const keyv = new Keyv('sqlite://database.sqlite');
keyv.on('error', err => console.error('Keyv connection error:', err));

// Configuration for nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUsername,
    pass: emailPassword
  }
});

module.exports = {
  execute(client) {

    // Code generation
    const generateCode = (length) => {
       var result           = '';
       var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
       var charactersLength = characters.length;
       for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
       }
       return result;
    };

    // Email verification
    const emailVerification = async (message, email) => {
      // If the user already has a code, delete it.
      if (await keyv.get(`${message.author.id}_code`)) {
        await keyv.delete(`${message.author.id}_code`);
      };

      // Store email
      await keyv.set(`${message.author.id}_email`, email);

      // Generate code from generateCode() function,
      // then set it in the database.
      const code = generateCode(6);
      await keyv.set(`${message.author.id}_code`, code, 3600000);

      // Define mailOptions
      const mailOptions = {
        from: emailUsername,
        to: email,
        subject: `Your code is ${code}`,
        text: `Hello,\n\nYour verification code is ${code} - message this to Naiden in order to confirm your email address. <u>This code will expire in 1 hour</u>.\n\nIf this wasn't you, safely disregard this email. Your address was entered by mistake.`,
        html: `Hello,<br><br>Your verification code is <strong>${code}</strong> - message this to Naiden in order to confirm your email address.<br><br><u>If this wasn't you, safely disregard this email.</u> Your address was entered by mistake.`
      };

      // Send email
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
      	console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }

      // Tell user that the email has been sent
        const embed = new Discord.MessageEmbed()
    			.setColor('#fcdb60')
    			.setTitle('👍 Pending Verification')
    			.setDescription(`Check your email, \`${email}\` for a code. __It expires in one hour__!\n\nIf you entered your email incorrectly, just send it again.`)
    		message.channel.send(embed);
      });

    };

    client.on('message', async message => {
            // If the message is from a bot, return
            if (message.author.bot) return;

            // If the message is *not* a DM, return.
            // This module only handles verification via DMs.
            if (message.channel.type !== 'dm') return;

            // If the member is already verified, return.
            if ( await keyv.get(`${message.author.id}_isVerified`) ) return;

            // If verification is *not* pending & message is an email
            if (/^[a-zA-Z0-9\.]+@(pps.net|student.pps.net)$/.test(message.content.trim())) {
              // Check if email is already in use
              if (await keyv.get(`${message.content.trim()}_taken`)) {
                const embed = new Discord.MessageEmbed()
                	.setColor('#f92921')
                	.setTitle('❌ Email Taken')
                	.setDescription(`\`${message.content.trim()}\` is already in use.\n\nContact an admin if you believe this is an error`);
                message.channel.send(embed);
              } else {
              emailVerification(message, message.content.trim());
              }

              // If message content = code
            } else if (await keyv.get(`${message.author.id}_code`) && message.content.toUpperCase().trim() === (await keyv.get(`${message.author.id}_code`))) {

              // Delete code record, and add a record for being verified
              await keyv.delete(`${message.author.id}_code`);
              await keyv.set(`${message.author.id}_isVerified`, true)

              // Prevent email from being used again
              const email = await keyv.get(`${message.author.id}_email`)
              await keyv.set(`${email}_taken`, true)

              // Add roles
              const guild = client.guilds.cache.get(guildID);
              const member = guild.members.cache.get(message.author.id);
              member.roles.add(verifiedRole);

              // Send DM
              let embed = new Discord.MessageEmbed()
                .setColor('#16c60c')
                .setTitle('✅ Verified')
                .setDescription(`You now have access to the rest of the Discord, thanks for joining!`);
              message.channel.send(embed);

              // Announce in welcomeChannel
              embed = new Discord.MessageEmbed()
              	.setColor('#fc54a0')
              	.setTitle(`👋 Welcome, ${member.user.username}!`)
                .setDescription('If you have a question/concern, feel free to message a <@&732337482560962581>');
              const channel = client.channels.cache.get(welcomeChannel);
              channel.send(embed);
            } else if (await keyv.get(`${message.author.id}_code`)) {
              const embed = new Discord.MessageEmbed()
              	.setColor('#f92921')
              	.setTitle('❌ Invalid Code')
              	.setDescription(`That code wasn\'t correct, but you can try again!\n\nIf you entered your email wrong, just send it again.`);
              message.channel.send(embed);
            } else {
              const embed = new Discord.MessageEmbed()
              	.setColor('#f92921')
              	.setTitle('❌ Invalid Email')
              	.setDescription(`That email isn\'t a valid PPS address, make sure it ends in \`@student.pps.net\` OR \`@pps.net\`.`);
              message.channel.send(embed);
            };
    });

    client.on('guildMemberAdd', async member => {
      if ( await keyv.get(`${member.user.id}_isVerified`) ) {
        member.roles.add(verifiedRole);
        // Return message
        const embed = new Discord.MessageEmbed()
        	.setColor('#fc54a0')
        	.setTitle(`👋 Welcome back, ${member.user.username}!`)
          .setDescription(`You were already verified, so you were given <@&${verifiedRole}> automatically`);
        const channel = client.channels.cache.get(welcomeChannel);
        channel.send(embed);
      } else {
        const embed = new Discord.MessageEmbed()
          .setColor('#fc54a0')
          .setTitle('👋 Welcome to the PPS Discord')
          .setDescription('Thanks for joining! Here\'s what you should do to get started...')
          .addFields(
    				{ name: `📜 Read the Rules`, value: `We have some rules that we ask you to follow in this server. Check them out in <#732005828613111969>.`, inline: true },
    				{ name: `✅ Verify`, value: `This server is only available to students & staff members of PPS. Send me your PPS email address to get started!`, inline: true },
    				{ name: `💬 Chat with others`, value: `Talk in <#732026866864750615>, post memes in <#732828689435197462>, or even hop into a voice chat!`, inline: true },
            { name: `➕ Add Roles`, value: `Once verified, head over to <#742167005641048176> to change your notification settings and more.`, inline: true },
            { name: `<a:minecraft_animated:741345683952500847> Join our Minecraft Server`, value: `If you play Minecraft, you can join our private server. Info can be found in <#735972102154223757>`, inline: true },
    			);
        member.user.send(embed);
      }
    });
  }
};
