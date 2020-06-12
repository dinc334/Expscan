"use strict";

const TelegramBot = require('node-telegram-bot-api');

const botSetting = require('../config/bot-settings.json');

const bot = new TelegramBot(botSetting.token, {polling: true});

function sendNotification(text) {
	bot.sendMessage(botSetting.chatId, text);
}

module.exports = sendNotification;