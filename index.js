const {
    app: e,
    BrowserWindow: t,
    ipcMain: r,
    dialog: o
} = require("electron"), fs = require("fs"), request = require("request"), path = require("path"), extract = require("extract-zip"), os = require("os"), axios = require("axios"), url = require("url"), http = require("http"), https = require("https"), AdmZip = require("adm-zip"), regedit = require("regedit"), yauzl = require("yauzl"), {
    exec: n
} = require("child_process"), query = require("samp-query"), mysql = require("mysql"), Registry = require("winreg");
let win, updateavailable = !1;
const homeDirectory = os.homedir(),
    downloadDirectory = `${homeDirectory}\\Documents\\ACERP\\GAME`,
    downloadPath = path.join(downloadDirectory, "ACE.zip"),
    outputPath = path.join(downloadDirectory, "ACE.zip"),
    updatePath = path.join(downloadDirectory, "update.zip");

function createWindow() {
    let e = new t({
        width: 945,
        height: 545,
        frame: !1,
        resizable: !1,
        maximizable: !1,
        icon: "logos.ico",
        webPreferences: {
            nodeIntegration: !0,
            contextIsolation: !1,
            preload: path.join(__dirname, "preload.js")
        }
    });
    e.setTitle("ACERP"), e.loadFile("index.html"), ! function e() {
        let t = path.join(os.homedir(), "Documents", "ACERP", "GAME", "gta_sa.exe");
        ! function e(t) {
            let o = new Registry({
                hive: Registry.HKCU,
                key: "\\Software\\SAMP"
            });
            o.set("gta_sa_exe", Registry.REG_SZ, t, e => {
                e ? console.error("Error setting registry:", e) : console.log("Registry key set successfully:", t)
            }), r.on("check-version", async e => {
                try {
                    let t = await axios.get("http://www.wh24892.web2.maze-tech.ru/version.txt"),
                        r = t.data.trim(),
                        o = path.join(os.homedir(), "Documents", "ACERP", "GAME", "data", "version.txt"),
                        n = fs.readFileSync(o, "utf8").trim();
                    e.sender.send("version-check-result", r !== n)
                } catch (a) {
                    console.error("Error checking version:", a), e.sender.send("version-check-result", !1)
                }
            })
        }(t)
    }()
}

function extractZip(e, t, r) {
    yauzl.open(e, {
        lazyEntries: !0
    }, (o, n) => {
        if (o) {
            console.error("Extraction error:", o);
            return
        }
        n.readEntry(), n.on("entry", e => {
            /\/$/.test(e.fileName) ? fs.mkdir(path.join(t, e.fileName), {
                recursive: !0
            }, e => {
                if (e) throw e;
                n.readEntry()
            }) : n.openReadStream(e, (r, o) => {
                if (r) throw r;
                let a = path.join(t, e.fileName);
                o.pipe(fs.createWriteStream(a)), o.on("end", () => {
                    n.readEntry()
                })
            })
        }), n.on("end", () => {
            console.log("Extraction complete"), r.sender.send("extraction-complete"), fs.unlink(e, e => {
                e ? console.error("Error deleting zip file:", e) : console.log("Zip file deleted successfully")
            })
        })
    })
}
async function checkVersionAndUpdateUI() {
    try {
        let t = path.join(e.getPath("home"), "Documents", "ACERP", "GAME", "data", "version.txt"),
            r = fs.readFileSync(t, "utf8").trim(),
            o = await axios.get("http://www.wh24892.web2.maze-tech.ru/version.txt"),
            n = o.data.trim();
        r !== n && mainWindow.webContents.executeJavaScript("showButton()")
    } catch (a) {
        console.error("Error checking version:", a)
    }
}

function checkVersionAndUpdateButton(e) {
    http.get("http://www.wh24892.web2.maze-tech.ru/update.zip", t => { 
        let r = "";
        t.on("data", e => {
            r += e
        }), t.on("end", () => {
            let t = r.trim(),
                o = path.join(os.homedir(), "Documents", "ACERP", "GAME", "data", "version.txt");
            fs.readFile(o, "utf8", (r, o) => {
                if (r) {
                    console.error("Error reading local version file:", r);
                    return
                }
                t !== (o = o.trim()) && e.webContents.executeJavaScript('document.getElementById("updateButton").style.display = "block";')
            })
        })
    }).on("error", e => {
        console.error("Error fetching remote version:", e)
    })
}
fs.existsSync(downloadDirectory) || fs.mkdirSync(downloadDirectory, {
    recursive: !0
}), e.whenReady().then(createWindow), e.on("window-all-closed", () => {
    "darwin" !== process.platform && e.quit()
}), e.on("activate", () => {
    0 === t.getAllWindows().length && createWindow()
}), r.on("download-file", t => {
    let r = os.homedir(),
        o = path.join(e.getPath("downloads"), "ACE.zip"),
        n = path.join(r, "Documents", "ACERP", "GAME"),
        a = fs.createWriteStream(o),
        i = 0;
    https.get("http://www.wh24892.web2.maze-tech.ru/ACE.zip", e => {
        let r = parseInt(e.headers["content-length"], 10);
        e.on("data", e => {
            i += e.length;
            let o = i / r * 100,
                n = i / 1024 / 1024;
            t.sender.send("download-progress", o, n)
        }), e.pipe(a), a.on("finish", () => {
            a.close(), extractZip(o, n, t)
        })
    }).on("error", e => {
        fs.unlink(o, () => {
            console.error("Download error:", e)
        })
    })
}), r.on("download-update", e => {
    let t = fs.createWriteStream(updatePath),
        r = 0;
    http.get("http://www.wh24892.web2.maze-tech.ru/update.zip", o => {
        let n = parseInt(o.headers["content-length"], 10);
        o.on("data", t => {
            r += t.length;
            let o = r / n * 100,
                a = r / 1024 / 1024;
            e.sender.send("download-progress", o, a)
        }), o.pipe(t), t.on("finish", () => {
            t.close();
            try {
                let r = new AdmZip(updatePath);
                r.extractAllTo(downloadDirectory, !0), console.log("Extraction complete"), fs.unlink(updatePath, t => {
                    t ? console.error("Error deleting zip file:", t) : (console.log("Zip file deleted successfully"), e.sender.send("extraction-complete"))
                })
            } catch (o) {
                console.error("Extraction error:", o)
            }
        })
    }).on("error", e => {
        fs.unlink(updatePath, () => {
            console.error("Download error:", e)
        })
    })
}), r.handle("launch-game", e => {
    let t = os.homedir(),
        r = path.join(t, "Documents", "ACERP", "GAME"),
        o = path.join(r, "samp.exe"),
        a = path.join(r, "Samp_Save.bat"),
        i = () => new Promise((e, t) => {
            http.get("http://www.wh24892.web2.maze-tech.ru/serverip.txt", r => {
                let o = "";
                r.on("data", e => {
                    o += e
                }), r.on("end", () => {
                    try {
                        let r = Buffer.from(o.trim(), "base64").toString("ascii");
                        e(r)
                    } catch (n) {
                        t("Failed")
                    }
                })
            }).on("error", e => {
                console.log("Error: " + e.message), t(e)
            })
        }),
        s = e => {
            let t = `"${o}" ${e}`;
            return console.log("Executing game command:", t), new Promise((e, r) => {
                n(t, t => {
                    t ? (console.error("Failed to launch game:", t), r("Failed to launch game")) : (console.log("Game launched successfully!"), n(`"${a}"`, t => {
                        t ? (console.error("Failed to execute batch file:", t), r("Failed to execute batch file")) : (console.log("Batch file executed successfully!"), e("Game launched and batch file executed successfully!"))
                    }))
                })
            })
        };
    return i().then(s)
}), r.on("set-player-name", (e, t) => {
    let r = `REG ADD "HKCU\\Software\\SAMP" /v PlayerName /t REG_SZ /d "${t}" /f`;
    n(r, (e, t, r) => {
        if (e) {
            console.error(`Error: ${e.message}`);
            return
        }
        if (r) {
            console.error(`Stderr: ${r}`);
            return
        }
        console.log(`Registry Updated: ${t}`)
    })
}), r.on("close-app", () => {
    e.quit()
}), r.on("minimize-app", e => {
    t.getFocusedWindow().minimize()
});