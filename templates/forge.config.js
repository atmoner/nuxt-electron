import { FusesPlugin } from "@electron-forge/plugin-fuses"
import { FuseV1Options, FuseVersion } from "@electron/fuses"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const packagerConfig = {
  asar: true,
  extraResource: [path.join(__dirname, ".output")],
}

export const rebuildConfig = {}

export const makers = [
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
]

export const plugins = [
  {
    name: "@electron-forge/plugin-auto-unpack-natives",
    config: {},
  },
  new FusesPlugin({
    version: FuseVersion.V1,
    [FuseV1Options.RunAsNode]: false,
    [FuseV1Options.EnableCookieEncryption]: true,
    [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
    [FuseV1Options.EnableNodeCliInspectArguments]: false,
    [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
    [FuseV1Options.OnlyLoadAppFromAsar]: true,
  }),
]
