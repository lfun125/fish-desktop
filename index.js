const { app, BrowserWindow, ipcMain, MessageChannelMain } = require('electron')
const path = require('path')
const cmd = require('node-cmd');

let exeFile = '';

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    })
    // win.webContents.openDevTools();
    win.loadFile('dist/index.html')

    let sync;

    ipcMain.on('fish', (ev, msg) => {
        const { port1 } = new MessageChannelMain()
        if (sync) {
            sync.kill(9)
            sync = null
            win.webContents.postMessage('action', 'kill', [port1])
            return
        }
        let exeCmd = `${exeFile} -fb ${msg['fb']} -om ${msg['om']} -l ${msg['l']}`
        if (msg['split']) {
            exeCmd += ` -split ${msg['split']}`
        }
        for (let v of msg['cycle']) {
            exeCmd += ` -cycle ${v['key']},${v['cast']}s,${v['cycle']}s`
            if (v['split'] && v['split'].length > 0) {
                const s = v['split'].join('|')
                exeCmd += `,${s}`
            }
        }
        console.log('exec', exeCmd)
        sync = cmd.run(exeCmd)
        win.webContents.postMessage('action', 'run', [port1])
        sync.stderr.addListener('data', (data) => {
            for (let v of (data + '').split('\n')) {
                v = v.trim()
                if (v == '') {
                    continue
                }
                const { port2 } = new MessageChannelMain()
                win.webContents.postMessage('fish_log', v, [port2])
            }
        })
    })

}

app.whenReady().then(() => {
    if (process.platform == 'darwin') {
        exeFile = path.join(__dirname, 'dist/assets/fish-macos')
    } else {
        exeFile = path.join(__dirname, 'dist/assets/fish.exe')
    }
    createWindow()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})


