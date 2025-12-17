export interface ElectronModuleOptions {
  /**
   * Enable Electron integration
   * @default true
   */
  enabled?: boolean

  /**
   * Electron main process file
   * @default 'main.js'
   */
  main?: string

  /**
   * Electron Forge configuration file
   * @default 'forge.config.js'
   */
  forgeConfig?: string

  /**
   * Port for Nuxt dev server
   * @default 3000
   */
  port?: number

  /**
   * Auto-start Electron in dev mode
   * @default true
   */
  autoStart?: boolean

  /**
   * Delay before starting Electron (ms)
   * @default 5000
   */
  startDelay?: number

  /**
   * Kill existing processes before starting
   * @default true
   */
  killExisting?: boolean
}

declare module '@nuxt/schema' {
  interface NuxtConfig {
    electron?: ElectronModuleOptions
  }
  interface NuxtOptions {
    electron?: ElectronModuleOptions
  }
}

export {}
