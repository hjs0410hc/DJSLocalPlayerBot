const {ActivityType} = require('discord.js');
const UtilCommands = new Map();
const UtilCommandList = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
      },
      {
      name: 'listuser',
      description: 'listing users'
    },
    {
      name: 'pt',
      description: 'presence activity test'
    }
];


UtilCommands.set('ping',async(interaction)=>{
    await interaction.reply('Pong!');
})


UtilCommands.set('listuser',async(interaction)=>{
    var msg = "```\n";
    const members = await interaction.guild.members.fetch();
    for(const member of members){
        msg += member[1].user.username + "\n";
    }
    msg += "```"
    await interaction.reply(msg);
})
UtilCommands.set('pt',async(interaction)=>{
    const clientUser = interaction.client.user;
    clientUser.setActivity("")
    console.log(clientUser.presence.activities)
    await interaction.reply('sent.');
})

module.exports = {UtilCommandList,UtilCommands};