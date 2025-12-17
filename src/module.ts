import {
  defineNuxtModule,
  addTemplate,
  createResolver,
  addServerPlugin,
} from "@nuxt/kit"
import { spawn, exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)
const sleep = (ms: number) =>
  new Promise((resolve) => globalThis.setTimeout(resolve, ms))

export interface ModuleOptions {
  /**
   * Enable Electron integration
   * @default true
   */
  enabled: boolean

  /**
   * Electron main process file
   * @default 'main.js'
   */
  main: string

  /**
   * Electron Forge configuration file
   * @default 'forge.config.js'
   */
  forgeConfig: string

  /**
   * Port for Nuxt dev server
   * @default 3000
   */
  port: number

  /**
   * Auto-start Electron in dev mode
   * @default true
   */
  autoStart: boolean

  /**
   * Delay before starting Electron (ms)
   * @default 5000
   */
  startDelay: number

  /**
   * Kill existing processes before starting
   * @default true
   */
  killExisting: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@atmoner/nuxt-electron",
    configKey: "electron",
    compatibility: {
      nuxt: ">=3.0.0",
    },
  },
  defaults: {
    enabled: true,
    main: "main.js",
    forgeConfig: "forge.config.js",
    port: 3000,
    autoStart: true,
    startDelay: 5000,
    killExisting: true,
  },
  async setup(options, nuxt) {
    if (!options.enabled) {
      return
    }

    const resolver = createResolver(import.meta.url)

    // Add Electron main template
    addTemplate({
      filename: "electron-main.js",
      src: resolver.resolve("../templates/main.js"),
      options: {
        port: options.port,
      },
    })

    // Add Forge config template
    addTemplate({
      filename: "electron-forge.config.js",
      src: resolver.resolve("../templates/forge.config.js"),
    })

    // Add build hook for packaging
    nuxt.hook("build:done", () => {
      if (!nuxt.options.dev) {
        console.log(
          "📦 Nuxt build complete. Run `npx electron-forge make` to package your app."
        )
      }
    })
  },
})
