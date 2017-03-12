'use strict';

const _ = require('lodash');
const Discord = require('discord.js');
const moment = require('moment');
const config = require('./config.js');

const bot = new Discord.Client();
const token = config.discord.token;
const rp = require('request-promise-native');

// Login to Discord
bot.login(token);

bot.on('ready', () => {
    console.log('Connected to Discord');


    // Auth with MrNodeBot
    rp({
            uri: config.mrNodeBot.server,
            json: true,
            method: 'POST',
            body: {
                nick: config.mrNodeBot.username,
                password: config.mrNodeBot.password
            }
        })
        // Attempt Auth
        .then(results => {
            if (!results.success) {
                // Something went wrong with auth
                console.log(`Unable to authenticate with MrNodeBot: ${results.message}`);
                return;
            }
            // No Token provided
            if (!_.isString(results.token) || _.isEmpty(results.token)) {
                console.log('The autheentication process did not return a token');
                return;
            }

            // Store token
            const webToken = results.token;
						console.dir(webToken);

            // Full Authenticated
            console.log('Authenticated with MrNodeBot');

            // Handle Discord Message
            bot.on('message', message => {

                // Is this us?
                if (message.author.username == config.discord.nick) return;

                // Check to see if I was mentioned
                let mentioned = false;
                let mentions = message.mentions.users;
                mentions.forEach(mention => {
                    if (_.isString(mention.username) && mention.username == config.watchFor) mentioned = true;
                });

                // No Need to continue
                if (!mentioned) return;

                const time = moment(message.createdTimestamp);

                let response = `${config.watchFor} was mentioned by ${message.author.username} on the ${message.channel.name} channel of ${message.channel.guild.name} server at ${time.format()}: ${message.content} `;

                // Log to console
                console.log(response);

                rp({
                        uri: config.mrNodeBot.endpoint,
												json: true,
                        method: 'POST',
                        body: {
                            token: webToken,
                            recipient: 'irony',
                            payload: response
                        }
                    })
                    .then(r => console.log)
                    .catch(e => console.dir)
            });

            bot.on('presenceUpdate', (oldMem, newMem) => {
                const guild = newMem.guild;
                const channel = bot.channels.find('name', 'general');
                if (newMem.user.presence.game) {
                    channel.sendMessage(`${newMem.user.username} is now playing ${newMem.user.presence.game.name}`);
                }
            });

        })
        // Error With Auth
        .catch(err => {
            console.log('Something went wrong authenticating with MrNodeBot');
            console.dir(err);
        });
});
