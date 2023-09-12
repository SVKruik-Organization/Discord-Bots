require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2');
const config = require('./assets/config.js');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions
	],
});
const blockedUsers = ['1'];
client.login(process.env.TOKEN);
log("\n\t------", "none");

// Guild Loading
for (let i = 0; i < config.general.guildId.length; i++) {
	const guild = client.guilds.fetch(config.general.guildId[i]);
	if (!guild) {
		log("Guild not found. Aborting.", "fatal");
		return process.exit(1);
	};
};
log("Fetched all guilds.", "info");

/**
 * Timestamp Calculation
 * @returns Object with date, time and new Date().
 */
function getDate() {
	const today = new Date();

	const hh = formatTime(today.getHours());
	const m = formatTime(today.getMinutes());
	const s = formatTime(today.getSeconds());

	const dd = String(today.getDate()).padStart(2, '0');
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const yyyy = today.getFullYear();

	const date = `${dd}-${mm}-${yyyy}`;
	const time = `${hh}:${m}:${s}`;

	/**
	 * Time formatter.
	 * @param {number} value Add an extra zero if the input number is not double digit.
	 * @returns Formatted value.
	 */
	function formatTime(value) {
		return value < 10 ? "0" + value : value.toString();
	};

	return { date, time, today };
};

/**
 * Log messages to the log file.
 * @param {string} data The data to log to the file.
 * @param {string} type The type of message. For example: warning, alert, info, fatal
 * @returns Status.
 */
function log(data, type) {
	let logData;
	if (type === "none") {
		logData = `${data}\n`;
	} else logData = `${getDate().time} [${type.toUpperCase()}] ${data}\n`;
	fs.appendFile(`./logs/${getDate().date}.log`, logData, (err) => {
		if (err) {
			console.log(`${getDate().time} [ERROR] Error appending to log file.`);
			return false;
		};
	});
	console.log(logData);
	return true;
};

// Database
const database = mysql.createPool({
	host: process.env.HOST,
	user: process.env.USER,
	database: process.env.DATABASE,
	password: process.env.PASSWORD
});
database.promise()
	.execute("SHOW databases")
	.then(() => {
		log("Database connection established.", "info");
	}).catch(() => {
		log("Connecting to the database went wrong. Aborting.", "fatal");
		return process.exit(1);
	});

// Exporting Values & Functions
module.exports = {
	"client": client,
	"database": database,
	"getDate": getDate,
	"blockedUsers": blockedUsers,
	"log": log
};

// Command Handler
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		return log(`Error at ${filePath}.`, "error");
	};
};

// Event Handler
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	};
};