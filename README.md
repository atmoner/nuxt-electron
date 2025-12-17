# @atmoner/nuxt-electron

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

Nuxt 4 module for seamless Electron integration with Electron Forge.

## Features

- ✨ **Zero Config** - Works out of the box with sensible defaults
- 🚀 **Auto Start** - Automatically launches Electron in development mode
- 🔄 **Hot Reload** - Full HMR support for your Nuxt app
- 📦 **Easy Packaging** - Built-in Electron Forge integration
- 🎯 **Type Safe** - Full TypeScript support
- ⚡ **Nuxt 4 Ready** - Built for the latest Nuxt

## Quick Setup

### Method 1: Automatic Setup (Recommended)

The easiest way to get started is using the init command:

```bash
# Using npx (no installation required)
npx @atmoner/nuxt-electron init

# Or if you have the package installed
npm exec nuxt-electron-init
```

This will automatically:

- ✅ Create `main.js` (Electron main process)
- ✅ Create `forge.config.cjs` (Electron Forge configuration)
- ✅ Create `scripts/dev-electron.js` (Development script)
- ✅ Update your `package.json` with required scripts and dependencies
- ✅ Add the module to your `nuxt.config.ts`
- ✅ Install all required dependencies

Then just run:

```bash
npm run electron:dev
```

That's it! Your Nuxt + Electron app is ready ✨

### Method 2: Manual Setup

1. Add `@atmoner/nuxt-electron` dependency to your project

```bash
# Using npm
npm install --save-dev @atmoner/nuxt-electron

# Using yarn
yarn add --dev @atmoner/nuxt-electron

# Using pnpm
pnpm add -D @atmoner/nuxt-electron
```

2. Add `@atmoner/nuxt-electron` to the `modules` section of `nuxt.config.ts`

```typescript
export default defineNuxtConfig({
  modules: ["@atmoner/nuxt-electron"],

  electron: {
    // Module options
  },
})
```

3. Install Electron dependencies

```bash
npm install --save-dev electron @electron-forge/cli @electron-forge/maker-squirrel @electron-forge/maker-zip @electron-forge/maker-deb @electron-forge/maker-rpm @electron-forge/plugin-fuses @electron/fuses
```

4. Create required files (or copy from `templates/` directory):
   - `main.js` - Electron main process
   - `forge.config.cjs` - Electron Forge configuration
   - `scripts/dev-electron.js` - Development script

## Usage

### Development

```bash
# If you used the automatic setup
npm run electron:dev

# Or manually
npm run dev
```

This will start both the Nuxt dev server and Electron automatically.

### Building

```bash
# Build for production
npm run electron:build

# Or step by step
npm run build
npx electron-forge make
```

## Configuration

### Module Options

```typescript
export default defineNuxtConfig({
  electron: {
    // Enable/disable the module
    enabled: true,

    // Electron main file
    main: "main.js",

    // Forge config file
    forgeConfig: "forge.config.js",

    // Nuxt dev server port
    port: 3000,

    // Auto-start Electron in dev mode
    autoStart: true,

    // Delay before starting Electron (ms)
    startDelay: 5000,

    // Kill existing processes on start
    killExisting: true,
  },
})
```

### Templates

The module provides default templates for:

- `main.js` - Electron main process
- `forge.config.js` - Electron Forge configuration

You can find these in the `templates/` directory.

## Project Structure

```
your-project/
├── app/
│   └── app.vue
├── public/
├── modules/
│   └── nuxt-electron/          # If developing locally
├── main.js                      # Electron main process
├── forge.config.js             # Electron Forge config
├── nuxt.config.ts
└── package.json
```

## Package.json Scripts

After running `npx @atmoner/nuxt-electron init`, your `package.json` will include:

```json
{
  "type": "module",
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare",
    "electron:dev": "node scripts/dev-electron.js",
    "electron:build": "nuxt build && electron-forge make"
  }
}
```

## How It Works

1. **Development Mode**: The module hooks into Nuxt's dev server lifecycle
2. **Auto Launch**: When Nuxt is ready, Electron starts automatically
3. **Clean Exit**: Processes are properly cleaned up on exit
4. **Production Build**: Nuxt builds to `.output/`, Electron Forge packages the app

## Example Project

Check out the `playground/` directory for a complete example.

## Advanced Usage

### Custom Electron Configuration

You can customize the Electron window in your `main.js`:

```javascript
const mainWindow = new BrowserWindow({
  width: 1200,
  height: 800,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
  },
})
```

### Multiple Makers

Configure different installers in `forge.config.js`:

```javascript
export const makers = [
  {
    name: "@electron-forge/maker-squirrel",
    platforms: ["win32"],
  },
  {
    name: "@electron-forge/maker-zip",
    platforms: ["darwin"],
  },
  {
    name: "@electron-forge/maker-deb",
    platforms: ["linux"],
  },
]
```

## Troubleshooting

### Port Already in Use

If you see "Port 24678 is already in use":

- The module automatically kills existing processes when `killExisting: true`
- Manually kill processes: `pkill -f "nuxt dev"`

### Electron Won't Start

- Check that `main.js` exists in your project root
- Ensure Electron dependencies are installed
- Try increasing `startDelay` in module options

### Build Issues

- Run `nuxt build` first before `electron-forge make`
- Check that `.output/` directory exists
- Verify `forge.config.js` includes `.output` in `extraResource`

## Development

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with the playground
npm run dev

# Build the module
npm run prepack

# Run tests
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](./LICENSE) License © 2025 [atmoner](https://github.com/atmoner)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@atmoner/nuxt-electron/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@atmoner/nuxt-electron
[npm-downloads-src]: https://img.shields.io/npm/dm/@atmoner/nuxt-electron.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@atmoner/nuxt-electron
[license-src]: https://img.shields.io/npm/l/@atmoner/nuxt-electron.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@atmoner/nuxt-electron
