const { createAudioPlayer,createAudioResource,joinVoiceChannel,AudioPlayerError,AudioPlayerStatus,AudioResource,VoiceConnection,getVoiceConnection,VoiceConnectionStatus } = require('@discordjs/voice');
const {ActivityType} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

var musicPath = ('audio');
const rootPath = musicPath;
var musicFiles = [];

const supportedExt = [
    ".mp3",".flac",".m4a",".wav",".wma",".aac",".ogg",".webm"
]


function readMusicFiles(){
    musicFiles = [];
    const tempFiles = fs.readdirSync(musicPath,{
        withFileTypes:true
    });
    for(const item of tempFiles){
        if(item.isDirectory()){
            musicFiles.push(item.name+" <DIR>");
        }else{
            musicFiles.push(item.name);
        }
    }
}

readMusicFiles();

const MusicCommands = new Map();
var curVolume = 1;

const queue = [];

const MusicCommandList = [
    {
        name:'join',
        description:'사용자가 들어 있는 음성 채널에 진입'
      },
      {
        name:'play',
        description:'음악을 재생합니다.',
        options:[
            {
                type:4,
                name:'idx',
                description:'음악 순번을 입력하세요.',
                required:false,
                min_value:0
            }
        ]
      },
      {
        name:'pause',
        description:'음악 일시정지'
      },
      {
        name:'resume',
        description:'음악 재개'
      },
      {
        name: 'leave',
        description: '음성 채널 나가기'
      },
      {
        name: 'vcinfo',
        description: 'voiceConnectionInfo'
      },
      {
        name: 'volume',
        description: '현재 볼륨을 표시하거나 볼륨을 설정',
        options:[
            {
                type:4,
                name:'vol',
                description:'원하는 볼륨 값을 입력하세요.',
                required:false,
                min_value:0,
                max_value:100
            }
        ]
      },
      {
        name: 'list',
        description: '음악 목록 표시'
      },
      {
        name:'add',
        description:'재생목록에 음악 추가 또는 경로 변경',
        options:[
            {
                type:4,
                name:'idx',
                description:'순번을 입력하세요. (/list 로 확인)',
                required:true,
                min_value:0
            }
        ]
      },
      {
        name: 'queue',
        description: '재생목록 표시'
      },
      {
        name: 'next',
        description: '다음 곡 재생하기'
      }
];

MusicCommands.set('join',async(interaction)=>{
    if(!interaction.member.voice.channel){
        return await interaction.reply('❌ 아무런 음성채널에 들어가 있지 않습니다.')
    }
    const voiceConnection = joinVoiceChannel({
        channelId:interaction.member.voice.channelId,
        guildId:interaction.guild.id,
        adapterCreator:interaction.guild.voiceAdapterCreator,
    })
    await interaction.reply('ℹ 음성 채널 진입: '+interaction.member.voice.channel.name)
    
})
MusicCommands.set('play',async(interaction)=>{
    const clientUser = interaction.client.user;
    const voiceConnection = getVoiceConnection(interaction.guildId)
    if(!voiceConnection){
        return await interaction.reply('❌ 봇이 음성채널에 연결되어 있지 않습니다.')
    }
    const audioPlayer = createAudioPlayer();
    voiceConnection.subscribe(audioPlayer);
    var audioResource;
    var idx = interaction.options.getInteger('idx');
    if(idx == null){
        if(queue.length === 0){
            return await interaction.reply('❌ 재생목록이 비어있습니다.')
        }else{
            idx = queue.shift();
            audioResource = createAudioResource(path.join(musicPath,musicFiles[idx]),{inlineVolume:true});
        }
    }else{
        audioResource = createAudioResource(path.join(musicPath,musicFiles[idx]),{inlineVolume:true});
    }
    if(!supportedExt.includes(path.extname(musicFiles[idx]))){
        interaction.client.user.setActivity("");
        voiceConnection.destroy();
        return await interaction.reply("❌ 잘못된 파일을 재생하려 했습니다.");
    }
    audioResource.volume.volume = curVolume;
    audioPlayer.on(AudioPlayerStatus.Idle,async ()=>{ // 오류나면 바로 여기로 와버려요 .
        if(queue.length===0){
            interaction.client.user.setActivity("");
            voiceConnection.destroy();
            await interaction.followUp('ℹ 재생이 완료되어 음성 채널에서 나갔습니다.');
        }else{
            idx = queue.shift();
            audioResource = createAudioResource(path.join(musicPath,musicFiles[idx]),{inlineVolume:true});
            audioResource.volume.volume = curVolume;
            try{
                audioPlayer.play(audioResource);
            }catch(e){
                return await interaction.reply(e);
            }
            clientUser.setActivity(musicFiles[idx],{type:ActivityType.Listening})
            await interaction.followUp('ℹ 다음 재생 음악: '+musicFiles[idx])
        }
    })
    try{
        audioPlayer.play(audioResource);
    }catch(e){
        return await interaction.reply(e);
    }
    clientUser.setActivity(musicFiles[idx],{type:ActivityType.Listening})
    await interaction.reply('ℹ 음악 재생: '+musicFiles[idx])
    
});
MusicCommands.set('pause',async(interaction)=>{
    const voiceConnection = getVoiceConnection(interaction.guildId);
    if(!voiceConnection){
        return await interaction.reply('❌ 봇이 음성채널에 연결되어 있지 않습니다.')
    }
    const subscription = voiceConnection._state.subscription;
    subscription.player.pause();
    await interaction.reply('ℹ 음악 일시정지: '+interaction.member.voice.channel.name)
    
});
MusicCommands.set('resume',async(interaction)=>{
    const voiceConnection = getVoiceConnection(interaction.guildId);
    if(!voiceConnection){
        return await interaction.reply('❌ 봇이 음성채널에 연결되어 있지 않습니다.')
    }
    const subscription = voiceConnection._state.subscription;
    subscription.player.unpause();
    await interaction.reply('ℹ 음악 일시정지 해제: '+interaction.member.voice.channel.name)
    
});
MusicCommands.set('leave',async(interaction)=>{
    const voiceConnection = getVoiceConnection(interaction.guildId)
    if(!voiceConnection){
        return await interaction.reply('❌ 봇이 음성채널에 연결되어 있지 않습니다.')
    }
    voiceConnection.destroy();
    interaction.client.user.setActivity("");
    await interaction.reply('ℹ 음성 채널 나감: '+interaction.member.voice.channel.name)
    
});
MusicCommands.set('vcinfo',async(interaction)=>{
    const voiceConnection = getVoiceConnection(interaction.guildId)
    console.log(voiceConnection);
    console.log(voiceConnection._state.subscription.player);
    await interaction.reply('vcinfo sent into console')
});
MusicCommands.set('volume',async(interaction)=>{
    const wantVolume = interaction.options.getInteger('vol')
    if(!wantVolume){
        return await interaction.reply('ℹ 현재 볼륨: '+curVolume*100);
    }
    const voiceConnection = getVoiceConnection(interaction.guildId)
    if(!voiceConnection){
        return await interaction.reply('❌ 봇이 음성채널에 연결되어 있지 않습니다.')
    }
    curVolume = wantVolume/100;
    const subscription = voiceConnection._state.subscription
    if(!subscription){
        return await interaction.reply('ℹ 볼륨 설정됨: '+wantVolume)
    }
    const player = subscription.player;
    const VC = player._state.resource.volume;
    VC.volume = curVolume;
    await interaction.reply('ℹ 볼륨 설정됨: '+wantVolume)
    
});
MusicCommands.set('list',async(interaction)=>{
    msg = '```\n';
    for(const [index,value] of musicFiles.entries()){
        msg = msg + index +': '+value + '\n';
    }
    msg = msg + '```';
    await interaction.reply("ℹ 현재 경로: "+musicPath+msg)
});
MusicCommands.set('add',async(interaction)=>{
    const idx = interaction.options.getInteger('idx')
    if(idx >= musicFiles.length){
        return await interaction.reply('❌ 잘못된 인덱스 입력됨')
    }
    var temp = path.join(musicPath,musicFiles[idx].split(' <')[0]);
    if(fs.lstatSync(temp).isDirectory()){
        musicPath = temp;
        readMusicFiles();
        if(musicPath != rootPath){
            musicFiles.push('..');
        }
        await interaction.reply('ℹ 현재 경로: '+musicPath);
    }else{
        queue.push(idx);
        await interaction.reply('✅재생목록에 추가됨: '+musicFiles[idx])
    }
});
MusicCommands.set('queue',async(interaction)=>{
    var msg = "```\n";
    for(const [index,value] of queue.entries()){
        msg = msg +index + ": " + musicFiles[value] + "\n"; 
    }
    msg = msg+"```";
    await interaction.reply("ℹ 현재 재생목록:\n"+msg)
});
MusicCommands.set('next',async(interaction)=>{
    const voiceConnection = getVoiceConnection(interaction.guildId)
    if(!voiceConnection){
        return interaction.reply("❌ 봇이 음성채널과 연결되어 있지 않습니다.");
    }
    if(queue.length === 0){
        return interaction.reply("❌ 큐가 비어 있어 다음 곡을 재생할 수 없습니다.");
    }
    const player = voiceConnection._state.subscription.player;
    player.emit('idle');
    await interaction.deferReply();
    await interaction.deleteReply();
});

module.exports = { MusicCommandList , MusicCommands };