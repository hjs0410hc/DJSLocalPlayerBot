const { REST, Routes } = require('discord.js');
const { Client, GatewayIntentBits, Message } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildVoiceStates,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildPresences] });
const {Commands,CommandList} = require('./commands');
require('dotenv').config();


const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log('명령어 목록 갱신 시도');
    await rest.put(Routes.applicationCommands(process.env.BOT_CLIENT_ID), { body: CommandList });

    console.log('명령어 목록이 갱신됨');
  } catch (error) {
    console.error(error);
  }
})();

client.on('ready', () => {
  console.log(`${client.user.tag}로 로그인되었습니다.`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    Commands.get(interaction.commandName)(interaction);
});

client.login(process.env.BOT_TOKEN);