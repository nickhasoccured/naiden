const Discord = require('discord.js');
const db = require('quick.db');
const nodemailer = require('nodemailer');

const config = require('../config.json');
const validEmailRegex = new RegExp(config.validEmailRegex, 'i');

// Configuration for nodemailer
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: config.emailUsername,
		pass: config.emailPassword
	}
});

const generateRandString = (length) => {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	for ( let i = 0; i < length; i++ ) {
	   result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
};

const emailVerification = (user, email) => {
	// If the user had a code, delete it
	db.delete(`${user.id}.code`);
	db.delete(`${user.id}.codeExpiration`);

	// Generate new code
	const userCode = generateRandString(6);
	const codeExpirationTime = Date.now() + 3600000;
	db.set(`${user.id}.code`, userCode);
	db.set(`${user.id}.codeExpiration`, codeExpirationTime)

	db.set(`${user.id}.email`, email)

	// Define mailOptions
	const mailOptions = {
		from: config.emailUsername,
		to: email,
		subject: `Your code is ${userCode}`,
		text:
			`Hello,
		
		Your verification code is ${userCode} - message this to Naiden in order to confirm your email address. <u>This code will expire in 1 hour</u>.
		
		If this wasn't you, safely disregard this email. Your address was entered by mistake.`,
		html: `Hello,<br><br>Your verification code is <strong>${userCode}</strong> - message this to Naiden in order to confirm your email address.<br><br><u>If this wasn't you, safely disregard this email.</u> Your address was entered by mistake.`
	};

	// Send email
	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(`Failed to send email to ${email} for user ${user.username}#${user.tag} (${user.id})
			* ${error}`);
		} else {
			console.log('Email sent: ' + info.response);
			// Tell user that the email has been sent
			const embed = new Discord.MessageEmbed()
				.setColor(config.theme.pendingColor)
				.setTitle('👍 Pending Verification')
				.setDescription(
					`Check your email, \`${email}\` for a code. __It expires in one hour__!
			
			If you lost your code or entered your email wrong, send the address again.`)
			user.send(embed)
				.catch((error) => {
					console.error(`Failed to send message to ${message.author.username}#${message.author.tag} (${message.author.id})
			* ${error}`);
				});
		};
	});
};

module.exports = {
	execute(client) {
		client.on('message', message => {
			// If the message is not in a DM, return
			// If the message author is a bot or is verified, return
			if (message.author.bot) return;
			if (message.channel.type !== 'dm') return;

			const guild = client.guilds.cache.get(config.mainGuild);
			if (!guild.members.cache.has(message.author.id)) return;

			const isVerified = db.get(`${message.author.id}.verified`) || false;
			if (isVerified) return;

			// Check if code is valid and define it
			let userCode = false;
			if (db.get(`${message.author.id}.code`) && Date.now() <= db.get(`${message.author.id}.codeExpiration`)) {
				userCode = db.get(`${message.author.id}.code`);
			};

			if (userCode && message.content.trim().toUpperCase() == userCode) {
				// Message is a valid code
				const member = guild.members.cache.get(message.author.id);
				const verifiedRole = db.get(`${guild.id}.verifiedRole`);

				// Add verification role in main guild
				member.roles.add(verifiedRole)
					.catch((error) => {
						console.error(`Failed to give verifiedRole (${verifiedRole}) to ${member.user.username}#${member.user.tag} (${member.user.id}) in ${member.guild.name} (${member.guild.id})
							* ${error}`);
					});

				// Send verification confirm message
				const verifyConfirmMessage = new Discord.MessageEmbed()
					.setColor(config.theme.successColor)
					.setTitle('✅ Verified')
					.setDescription(`You now have access to the rest of the Discord, thanks for joining!`);
				member.user.send(verifyConfirmMessage)
					.catch((error) => {
						console.error(`Failed to send message to ${message.author.username}#${message.author.tag} (${message.author.id})
							* ${error}`);
					});

				// Send welcome message
				const channel = guild.channels.cache.get(db.get(`${guild.id}.welcomeChannel`)) || false;
				if (channel) {
					const welcomeMessage = new Discord.MessageEmbed()
						.setColor(config.theme.generalColor)
						.setTitle(`👋 Welcome, ${member.displayName}!`);
					channel.send(welcomeMessage)
						.catch((error) => {
							console.error(`Failed to send message in #${channel.name} (${channel.id}) in ${channel.guild.name} (${channel.guild.id})
								* ${error}`);
						});
				};
				return;
			} else if (/^[a-zA-Z0-9\.]+@(pps.net|student.pps.net)$/.test(message.content.trim().toLowerCase())) {
				// Message is a valid email address
				emailVerification(message.author, message.content.trim().toLowerCase());
				return;
			} else if (userCode && message.content.trim().toUpperCase() !== userCode) {
				// User has a code but it's not valid
                const invalidCodeMessage = new Discord.MessageEmbed()
                    .setColor(config.theme.errorColor)
                    .setTitle('❌ Invalid Code')
                    .setDescription(
						`That code wasn\'t correct, try again!
						
						If you lost your code or entered your email wrong, send the address again.`);
				message.channel.send(invalidCodeMessage)
					.catch((error) => {
						console.error(`Failed to send message to ${message.author.username}#${message.author.tag} (${message.author.id})
						* ${error}`);
					});
			} else {
				// Nothing else was true (email isn't valid)
				const invalidEmailMessage = new Discord.MessageEmbed()
					.setColor('#f92921')
					.setTitle('❌ Invalid Email')
					.setDescription(`That email isn\'t a valid PPS address, make sure it ends in \`@student.pps.net\` OR \`@pps.net\`.`);
				message.channel.send(invalidEmailMessage)
					.catch((error) => {
						console.error(`Failed to send message to ${message.author.username}#${message.author.tag} (${message.author.id})
					* ${error}`);
					});
			};
		});
	},
};