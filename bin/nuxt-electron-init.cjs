#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

const templates = {
  "main.js": `import path from "path"
import { fileURLToPath } from "url"
import electron from "electron"
import { spawn } from "child_process"

const { app, BrowserWindow } = electron

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
    show: false,
  })

  if (app.isPackaged) {
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

    await new Promise((resolve) => setTimeout(resolve, 3000))
  } else {
    console.log("⏳ Waiting for Nuxt dev server to be ready...")
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  console.log("🌐 Loading http://localhost:3000")

  try {
    await mainWindow.loadURL("http://localhost:3000")
    console.log("✅ Nuxt app loaded successfully")

    mainWindow.show()

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
`,

  "forge.config.cjs": `const { FusesPlugin } = require("@electron-forge/plugin-fuses")
const { FuseV1Options, FuseVersion } = require("@electron/fuses")
const path = require("path")

module.exports = {
  packagerConfig: {
    asar: true,
    extraResource: [path.join(__dirname, ".output")],
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      platforms: ["win32"],
      config: {},
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  plugins: [
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
}
`,

  "scripts/dev-electron.js": `import { spawn, exec } from "child_process"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { promisify } from "util"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const execAsync = promisify(exec)
try {
  await execAsync('pkill -f "nuxt dev" || true')
  await execAsync('pkill -f "electron" || true')
  console.log("Cleaned up existing processes...")
  await setTimeout(1000)
} catch (err) {
  // Ignore errors if no processes exist
}

const nuxtProcess = spawn("npm", ["run", "dev"], {
  stdio: "inherit",
  shell: true,
  cwd: join(__dirname, ".."),
})

setTimeout(() => {
  console.log("🚀 Starting Electron...")
  const electronProcess = spawn("electron", ["main.js"], {
    stdio: "inherit",
    shell: true,
    cwd: join(__dirname, ".."),
  })

  electronProcess.on("exit", () => {
    nuxtProcess.kill()
    process.exit()
  })
}, 5000)

process.on("SIGINT", () => {
  nuxtProcess.kill()
  process.exit()
})
`,
}

function createFile(filePath, content) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(filePath, content, "utf-8")
  console.log(`✅ Created: ${filePath}`)
}

function updatePackageJson() {
  const packageJsonPath = path.join(process.cwd(), "package.json")

  if (!fs.existsSync(packageJsonPath)) {
    console.error("❌ package.json not found in current directory")
    process.exit(1)
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"))

  // Add type: module if not present
  if (!packageJson.type) {
    packageJson.type = "module"
  }

  // Add scripts
  if (!packageJson.scripts) {
    packageJson.scripts = {}
  }

  packageJson.scripts["electron:dev"] = "node scripts/dev-electron.js"
  packageJson.scripts["electron:build"] = "nuxt build && electron-forge make"

  // Add dependencies if not present
  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {}
  }

  const requiredDevDeps = {
    "@atmoner/nuxt-electron": "latest",
    "@electron-forge/cli": "^7.10.2",
    "@electron-forge/maker-deb": "^7.10.2",
    "@electron-forge/maker-rpm": "^7.10.2",
    "@electron-forge/maker-squirrel": "^7.10.2",
    "@electron-forge/maker-zip": "^7.10.2",
    "@electron-forge/plugin-fuses": "^7.10.2",
    "@electron/fuses": "^1.8.0",
    electron: "^39.2.7",
  }

  Object.entries(requiredDevDeps).forEach(([pkg, version]) => {
    if (!packageJson.devDependencies[pkg] && !packageJson.dependencies?.[pkg]) {
      packageJson.devDependencies[pkg] = version
    }
  })

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2),
    "utf-8"
  )
  console.log("✅ Updated package.json")
}

function updateNuxtConfig() {
  const nuxtConfigPath = path.join(process.cwd(), "nuxt.config.ts")

  if (!fs.existsSync(nuxtConfigPath)) {
    console.log("⚠️  nuxt.config.ts not found, skipping...")
    return
  }

  let content = fs.readFileSync(nuxtConfigPath, "utf-8")

  // Check if module is already added
  if (content.includes("@atmoner/nuxt-electron")) {
    console.log("✅ @atmoner/nuxt-electron already in nuxt.config.ts")
    return
  }

  // Add module to modules array
  if (content.includes("modules:")) {
    content = content.replace(
      /modules:\s*\[/,
      "modules: [\n    '@atmoner/nuxt-electron',"
    )
  } else {
    content = content.replace(
      /export default defineNuxtConfig\(\{/,
      "export default defineNuxtConfig({\n  modules: ['@atmoner/nuxt-electron'],"
    )
  }

  fs.writeFileSync(nuxtConfigPath, content, "utf-8")
  console.log("✅ Updated nuxt.config.ts")
}

console.log("🚀 Initializing @atmoner/nuxt-electron...\n")

// Create files
Object.entries(templates).forEach(([filename, content]) => {
  const filePath = path.join(process.cwd(), filename)
  if (fs.existsSync(filePath)) {
    console.log(`⚠️  ${filename} already exists, skipping...`)
  } else {
    createFile(filePath, content)
  }
})

// Update package.json
updatePackageJson()

// Update nuxt.config.ts
updateNuxtConfig()

console.log("\n✅ Initialization complete!")
console.log("\n📦 Installing dependencies...")

try {
  execSync("npm install", { stdio: "inherit", cwd: process.cwd() })
  console.log("\n✅ Dependencies installed!")
} catch (error) {
  console.error(
    '\n❌ Failed to install dependencies. Please run "npm install" manually.'
  )
}

console.log("\n🎉 Setup complete! You can now run:")
console.log("   npm run electron:dev    - Start development")
console.log("   npm run electron:build  - Build for production")
