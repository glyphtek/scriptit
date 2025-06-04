---
layout: home

hero:
  name: "ScriptIt"
  text: "Cross-Runtime Script Runner"
  tagline: "Execute scripts with environment management, TUI, and colored console output across Bun, Node.js, and Deno"
  image:
    src: /logo.svg
    alt: ScriptIt
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/glyphtek/scriptit

features:
  - icon: 🎨
    title: Colored Console Output
    details: Beautiful colored console.log, console.error, console.warn with automatic color coding for better debugging experience.
  - icon: ⚡
    title: Cross-Runtime Support
    details: Run scripts seamlessly across Bun, Node.js, and Deno with automatic runtime detection and optimization.
  - icon: 🖥️
    title: Terminal UI (TUI)
    details: Interactive terminal interface for script management with real-time output and enhanced user experience.
  - icon: 🔧
    title: Environment Management
    details: Sophisticated environment variable handling with .env file support and runtime-specific configurations.
  - icon: 📦
    title: CLI & Library
    details: Use as a command-line tool or integrate as a library in your projects with full TypeScript support.
  - icon: 🚀
    title: Script Execution
    details: Execute JavaScript/TypeScript scripts with enhanced context, environment variables, and colored console output.
---

## Quick Start

### Installation

::: code-group

```bash [Bun]
bun add @glyphtek/scriptit
```

```bash [npm]
npm install @glyphtek/scriptit
```

```bash [pnpm]
pnpm add @glyphtek/scriptit
```

```bash [yarn]
yarn add @glyphtek/scriptit
```

:::

### CLI Usage

```bash
# Run a script with colored console output (colors enabled by default)
scriptit exec my-script.js

# Interactive TUI mode (default when running without arguments)
scriptit run

# Specify runtime
scriptit exec script.ts --runtime bun

# Initialize a new project
scriptit init
```

### Library Usage

```typescript
import { createScriptRunner } from '@glyphtek/scriptit'

const runner = await createScriptRunner({
  scriptsDir: './scripts',
  tmpDir: './tmp',
  consoleInterception: {
    enabled: true,
    useColors: true
  }
})

await runner.executeScript('my-script.js')
```

## What's New in v0.5.1

- 📚 **Enhanced Documentation**: Comprehensive README improvements with better organization and accuracy
- 🚀 **GitHub Pages Deployment**: Automated documentation deployment with GitHub Actions
- 🔧 **Type Safety**: Better TypeScript types with `unknown[]` instead of `any[]`
- ✅ **Better CLI Documentation**: Corrected and expanded CLI command documentation

## What's New in v0.6.0

- 🎯 **Interactive Environment Prompts**: Revolutionary secure variable collection system
- 📝 **Declarative Variables**: Scripts can export `variables` to define required inputs  
- 🔐 **Password Masking**: Secure input for sensitive data with hidden characters
- 🎛️ **CLI Integration**: New `--env-prompts` flag for on-demand variable prompting
- 🔄 **Smart Detection**: Only prompts for variables that aren't already set

## What's New in v0.7.0

- 🏗️ **Unified Architecture**: Complete refactoring with shared execution engine across CLI and TUI
- 🎨 **Enhanced TUI Prompting**: Beautiful modal dialogs for environment variable collection
- 🔧 **CLI Improvements**: Centralized options and reduced code duplication
- 📚 **Architecture Guide**: Comprehensive documentation of the new unified system
- ⚡ **Better Maintainability**: Significant code organization improvements for future development

## Why ScriptIt?

ScriptIt bridges the gap between different JavaScript runtimes, providing a unified interface for script execution with enhanced developer experience. Whether you're prototyping, automating tasks, or building complex workflows, ScriptIt offers the tools you need with the flexibility to work across any runtime.

<div class="tip custom-block" style="padding-top: 8px">

Just want to try it out? Skip the installation and jump right to the [Getting Started](/getting-started) guide.

</div> 