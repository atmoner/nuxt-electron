import path from "path"
import { fileURLToPath } from "url"
import { app, BrowserWindow } from "electron"
import { spawn } from "child_process"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let nuxtProcess = null

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (app.isPackaged) {
    // Start Nuxt server from built output
    const nuxtPath = path.join(
      __dirname,
      "..",
      "..",
      ".output",
      "server",
      "index.mjs"
    )
    
    nuxtProcess = spawn("node", [nuxtPath], {
      detached: true,
      stdio: "inherit",
    })
  }

  // Load Nuxt app
  mainWindow.loadURL("http://localhost:<%= options.port %>")

  // Open DevTools in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools()
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("before-quit", () => {
  if (nuxtProcess) {
    nuxtProcess.kill()
  }
})
