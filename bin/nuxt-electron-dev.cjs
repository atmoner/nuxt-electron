#!/usr/bin/env node

const { spawn } = require('child_process')
const { resolve } = require('path')

const cwd = process.cwd()
const args = process.argv.slice(2)
const playgroundDir = args[0] || 'playground'

console.log('🚀 Starting Nuxt + Electron development environment...')

// Start Nuxt dev server
console.log('📦 Starting Nuxt dev server...')
const nuxtProcess = spawn('npx', ['nuxi', 'dev', playgroundDir], {
  cwd,
  stdio: 'inherit',
  shell: true
})

// Wait a bit for Nuxt to start, then launch Electron
setTimeout(() => {
  console.log('⚡ Starting Electron...')
  const electronProcess = spawn('npx', ['electron-forge', 'start'], {
    cwd,
    stdio: 'inherit',
    shell: true
  })

  electronProcess.on('exit', (code) => {
    console.log(`🛑 Electron exited with code ${code}`)
    nuxtProcess.kill()
    process.exit(code || 0)
  })
}, 5000)

nuxtProcess.on('exit', (code) => {
  console.log(`🛑 Nuxt exited with code ${code}`)
  process.exit(code || 0)
})

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...')
  nuxtProcess.kill()
  process.exit(0)
})
