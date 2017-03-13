'use strict';
const _ = require('lodash');
const rp = require('request-promise-native');
const config = require('./config.js');

// Send a message to the MrNodeBot service
module.exports = (recipient, payload) =>
    new Promise((res, rej) => rp({
            uri: config.mrNodeBot.server,
            json: true,
            method: 'POST',
            body: {
                nick: config.mrNodeBot.username,
                password: config.mrNodeBot.password
            }
        })
        .then(authResults => {
            if (!authResults.success) return rej(new Error(`Unable to Authenticate with MrNodeBot: ${authResults.message}`));
            if (!_.isString(authResults.token) || _.isEmpty(authResults.token)) return rej(new Error('The Authentication process did not return a token'));

            const webToken = authResults.token;

            // Send Message to MrNodeBot
            return rp({
                    uri: config.mrNodeBot.endpoint,
                    json: true,
                    method: 'POST',
                    body: {
                        token: webToken,
                        recipient,
                        payload
                    }
                })
                .then(r => console.log(`Message from ${recipient}: ${payload}`));
        }));
