const UtilCommands = new Map();
const UtilCommandList = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
      }
];

UtilCommands.set('ping',async(interaction)=>{
    await interaction.reply('Pong!');
})

module.exports = {UtilCommandList,UtilCommands};