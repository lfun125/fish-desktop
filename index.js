const { app, BrowserWindow, ipcMain, MessageChannelMain } = require('electron')
const path = require('path')
// const cmd = require('node-cmd');
const child_process = require('child_process')
const exec = child_process.exec

let exeFile = '';
let sync;

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

    ipcMain.on('fish', (ev, msg) => {
        const { port1 } = new MessageChannelMain()
        if (sync) {
            killByPid(sync.pid)
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
        sync = exec(exeCmd)
        win.webContents.postMessage('action', 'run', [port1])
        sync.stderr.on('data', (data) => {
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
    console.log('close', sync)
    if (sync) {
        killByPid(sync.pid)
    }
    setTimeout(() => {
        app.quit()
    }, 2000);
})

function killByPid(pid) {
    if (/^win/.test(process.platform)) {
        child_process.spawn("taskkill", ["/PID", pid, "/T", "/F"])
    } else {
        process.kill(-pid, 'SIGTERM')
    }
}