
const ipcRenderer = require('electron').ipcRenderer
const contextBridge = require('electron').contextBridge
contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => {
        console.log(1, channel, data)
        ipcRenderer.send(channel, data)
    },
    receive: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
})

