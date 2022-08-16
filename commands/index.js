const {MusicCommandList,MusicCommands} = require('./music.js')
const {UtilCommandList,UtilCommands} = require('./util.js')


const Commands = new Map([...MusicCommands,...UtilCommands]);
const CommandList = [
    ...MusicCommandList,
    ...UtilCommandList
]

module.exports = {Commands,CommandList};