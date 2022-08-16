const { REST, Routes } = require('discord.js');
const { Client, GatewayIntentBits, Message } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildVoiceStates,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildPresences] });
const {Commands,CommandList} = require('./commands');
require('dotenv').config();


const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationCommands(process.env.BOT_CLIENT_ID), { body: CommandList });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    Commands.get(interaction.commandName)(interaction);
});

client.login(process.env.BOT_TOKEN);