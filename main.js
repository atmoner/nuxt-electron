import path from "path"
import { fileURLToPath } from "url"
import { app, BrowserWindow } from "electron"
import { spawn } from "child_process"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let nuxtProcess = null

async function createWindow() {
  console.log("🪟 Creating Electron window...")

  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false, // Don't show until ready
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

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 3000))
  } else {
    // In dev mode, wait a bit for Nuxt dev server
    console.log("⏳ Waiting for Nuxt dev server to be ready...")
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  console.log("🌐 Loading http://localhost:3000")

  // Load Nuxt app
  try {
    await mainWindow.loadURL("http://localhost:3000")
    console.log("✅ Nuxt app loaded successfully")

    // Show window when ready
    mainWindow.show()

    // Open DevTools in development
    if (!app.isPackaged) {
      mainWindow.webContents.openDevTools()
    }
  } catch (error) {
    console.error("❌ Failed to load Nuxt app:", error)
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
    if (nuxtProcess) {
      nuxtProcess.kill()
    }
    app.quit()
  }
})

app.on("will-quit", () => {
  if (nuxtProcess) {
    nuxtProcess.kill()
  }
})
