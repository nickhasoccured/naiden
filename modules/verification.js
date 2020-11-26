const Discord = require('discord.js');
const db = require('quick.db');
const nodemailer = require('nodemailer');

const config = require('../config.json');

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
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	};
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
			`Hello there,

			Somebody (hopefully you) used your email address on the PPS Discord server. If this wasn't you, disregard this email - your address was entered by mistake.
			
			Anyway, before we let you in, we have to make sure it's really you. Message the code ${userCode} back to Naiden in order to confirm your identity.
			
			Thanks!`,
		html: `Hello there,<br><br>Somebody (hopefully you) used your email address on the PPS Discord server. If this wasn't you, disregard this email - your address was entered by mistake.<br><br>Anyway, before we let you in, we have to make sure it's really you. Message the code <strong>${userCode}</strong> back to Naiden in order to confirm your identity. <br><br>Thanks!`
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
	"name": "verification",
	"startup": true,
	execute(client) {
		client.on('message', message => {
			// If the message is not in a DM, return
			// If the message author is a bot or is verified, return
			if (message.author.bot) return;
			if (message.channel.type !== 'dm') return;

			const verifiedRole = db.get(`${guild.id}.verifiedRole`);
			if (!verifiedRole) return;

			const guild = client.guilds.resolve(config.mainGuild);
			const member = guild.members.resolve(message.author.id);
			if (!member) return;

			const isVerified = db.get(`${message.author.id}.verified`) || false;
			if (isVerified) return;

			// Check if code is valid and define it
			let userCode = false;
			if (db.get(`${message.author.id}.code`) && Date.now() <= db.get(`${message.author.id}.codeExpiration`)) {
				userCode = db.get(`${message.author.id}.code`);
			};

			if (userCode && message.content.trim().toUpperCase() == userCode) {
				// Message is a valid code
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
				const channel = guild.channels.resolve(db.get(`${guild.id}.welcomeChannel`)) || false;
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
				const duplicateEmails = db.all().filter(record => (record.data.email === message.content.trim().toLowerCase()) && (record.data.verified === true));
				if (duplicateEmails.length) {
					const duplicateEmailMessage = new Discord.MessageEmbed()
						.setColor('#f92921')
						.setTitle('❌ Duplicate Email')
						.setDescription(`That address has already been used for verification. If you believe this is an error, contact a server administrator.`);
					return message.channel.send(duplicateEmailMessage)
						.catch((error) => {
							console.error(`Failed to send message to ${message.author.username}#${message.author.tag} (${message.author.id})
					* ${error}`);
						});
				} else {
					return emailVerification(message.author, message.content.trim().toLowerCase());
				};
			} else if (userCode && message.content.trim().toUpperCase() !== userCode) {
				// User has a code but it's not valid
				const invalidCodeMessage = new Discord.MessageEmbed()
					.setColor(config.theme.errorColor)
					.setTitle('❌ Invalid Code')
					.setDescription(
						`That code wasn\'t correct, try again!
						
						If you lost your code or entered your email wrong, send the address again.`);
				return message.channel.send(invalidCodeMessage)
					.catch((error) => {
						console.error(`Failed to send message to ${message.author.username}#${message.author.tag} (${message.author.id})
						* ${error}`);
					});
			} else {
				// Nothing else was true (email isn't valid)
				const invalidEmailMessage = new Discord.MessageEmbed()
					.setColor(config.theme.errorColor)
					.setTitle('❌ Invalid Email')
					.setDescription(`That email isn\'t a valid PPS address, make sure it ends in \`@student.pps.net\` OR \`@pps.net\`.`);
				return message.channel.send(invalidEmailMessage)
					.catch((error) => {
						console.error(`Failed to send message to ${message.author.username}#${message.author.tag} (${message.author.id})
					* ${error}`);
					});
			};
		});
	},
};