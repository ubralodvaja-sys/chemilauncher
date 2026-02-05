const {
    ipcRenderer: e,
    shell: t
} = require("electron"), {
    exec: n
} = require("child_process"), Winreg = require("winreg"), {
    promisify: l
} = require("util"), execAsync = l(n), fs = require("fs"), path = require("path"), os = require("os"), query = require("samp-query");
let isFirstFetch = !0;
const nicknameInput = document.getElementById("playerNameInput");

function checkForGame() {
    let e = os.homedir(),
        t = path.join(e, "Documents", "ACERP", "GAME"),
        n = path.join(t, "samp.exe");
    fs.access(n, fs.constants.F_OK, e => {
        let t = document.getElementById("openGame"),
            n = document.getElementById("downloadText"),
            l = document.getElementById("backp");
        e ? (t.style.display = "none", n.style.display = "none") : (t.style.display = "block", downloadBtn.style.display = "none", l.style.display = "none")
    })
}

function getSAMPPlayerCount() {
    let e = {
        host: "185.189.255.97",
        port: 3306
    };
    return new Promise((t, n) => {
        query(e, function(e, l) {
            e ? (console.error("Error querying the SA-MP server:", e), n(e)) : (console.log(l), t(l.online))
        })
    })
}
document.getElementById("downloadBtn").addEventListener("click", () => {
    e.send("download-file"), document.getElementById("downloadProgress").style.display = "block", document.getElementById("downloadText").style.display = "block"
}), e.on("download-progress", (e, t, n) => {
    document.getElementById("downloadProgress").value = t, document.getElementById("downloadText").innerText = `მიმდინარეობს ინსტალაცია... ${t.toFixed(2)}%, ${n.toFixed(2)} MB`
}), e.on("extraction-complete", () => {
    console.log("Extraction completed"), document.getElementById("downloadProgress").style.display = "none", document.getElementById("downloadText").innerText = "ინსტალაცია დასრულდა", document.getElementById("downloadBtn").style.display = "none", document.getElementById("openGame").style.display = "block"
}), document.getElementById("updateButton").addEventListener("click", () => {
    e.send("download-update"), document.getElementById("downloadProgress").style.display = "block", document.getElementById("downloadText").style.display = "block"
}), e.on("download-progress", (e, t, n) => {
    document.getElementById("downloadProgress").value = t, document.getElementById("downloadText").innerText = `მიმდინარეობს ინსტალაცია... ${t.toFixed(2)}%, ${n.toFixed(2)} MB`
}), e.on("extraction-complete", () => {
    console.log("Extraction completed"), document.getElementById("downloadProgress").style.display = "none", document.getElementById("downloadText").innerText = "ინსტალაცია დასრულდა", document.getElementById("updateButton").style.display = "none", document.getElementById("downloadBtn").style.display = "none", document.getElementById("openGame").style.display = "block"
}), document.getElementById("openGame").addEventListener("click", () => {
    e.invoke("launch-game").then(e => {
        console.log(e)
    }).catch(e => {
        console.error(e)
    })
}), document.addEventListener("DOMContentLoaded", () => {
    let e = localStorage.getItem("playerName");
    e && (document.getElementById("playerNameInput").value = e), document.getElementById("playerNameInput").addEventListener("input", e => {
        localStorage.setItem("playerName", e.target.value)
    }), checkForGame()
}), document.getElementById("playerNameInput").addEventListener("input", t => {
    let n = t.target.value;
    e.send("set-player-name", n)
}), document.getElementById("exit").addEventListener("click", () => {
    e.send("close-app")
}), document.getElementById("mini").addEventListener("click", () => {
    e.send("minimize-app")
});
const homeDirectory = os.homedir(),
    downloadDirectory = path.join(homeDirectory, "Documents", "ACERP", "GAME"),
    baseFileName = "enbseries.asi",
    baseFilePath = path.join(downloadDirectory, "enbseries.asi"),
    disabledFilePath = baseFilePath + ".disabled";

function setInitialState(e) {
    e.checked = fs.existsSync(baseFilePath) && !fs.existsSync(disabledFilePath)
}

function renameFile(e, t) {
    fs.rename(e, t, e => {
        e ? (console.error("Error renaming file:", e), checkbox.checked = !checkbox.checked) : console.log("File renamed successfully")
    })
}

function setupFileToggle(e, t, n) {
    let l = path.join(n, t),
        s = l + ".disabled",
        o = document.getElementById(e);

    function d(e, t) {
        fs.rename(e, t, e => {
            e ? (console.error("Error renaming file:", e), o.checked = !o.checked) : console.log("File renamed successfully")
        })
    }
    o.checked = fs.existsSync(l) && !fs.existsSync(s), o.addEventListener("change", () => {
        o.checked ? fs.existsSync(s) && d(s, l) : fs.existsSync(l) && d(l, s)
    })
}

function setupFileToggle(e, t, n) {
    let l = path.join(n, t),
        s = l + ".disabled",
        o = document.getElementById(e);

    function d(e, t) {
        fs.rename(e, t, e => {
            e ? (console.error("Error renaming file:", e), o.checked = !o.checked) : console.log("File renamed successfully")
        })
    }
    o.checked = fs.existsSync(l) && !fs.existsSync(s), o.addEventListener("change", () => {
        o.checked ? fs.existsSync(s) && d(s, l) : fs.existsSync(l) && d(l, s)
    })
}

function getSAMPPlayerCount() {
    let e = {
        host: "185.189.255.97",
        port: 3371
    };
    return new Promise((t, n) => {
        query(e, function(e, l) {
            e ? (console.error("Error querying the SA-MP server:", e), n(e)) : (console.log(l), t(l.online))
        })
    })
}
async function updatePlayerCount() {
    try {
        let e = await getSAMPPlayerCount();
        document.getElementById("player-count").textContent = `${e}`
    } catch (t) {
        document.getElementById("player-count").textContent = "150"
    }
}
document.addEventListener("DOMContentLoaded", () => {
    let e = document.getElementById("enb");
    setInitialState(e), e.addEventListener("change", () => {
        e.checked ? fs.existsSync(disabledFilePath) && renameFile(disabledFilePath, baseFilePath) : fs.existsSync(baseFilePath) && renameFile(baseFilePath, disabledFilePath)
    })
}), setInterval(updatePlayerCount, 5e3), document.addEventListener("DOMContentLoaded", () => {
    let e = os.homedir(),
        t = path.join(e, "Documents", "ACERP", "GAME"),
        n = path.join(e, "Documents", "ACERP", "GAME", "mlife1_server");
    setupFileToggle("enb", "enbseries.asi", t), setupFileToggle("TEQSTUREBI-CHASARTVELI", "mlife_textures.img", n)
}), e.send("check-version"), e.on("version-check-result", (e, t) => {
    if (t) {
        let n = document.getElementById("updateButton");
        n.style.display = "block", openGame.style.display = "none"
    }
});