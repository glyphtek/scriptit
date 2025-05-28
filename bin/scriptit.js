#!/usr/bin/env node

// ScriptIt CLI Entry Point
// Compatible with Node.js, Deno, and Bun

async function main() {
  try {
    // Import and run the CLI from the compiled dist directory
    await import("../dist/cli.js");
  } catch (error) {
    console.error("❌ ScriptIt Error:", error.message);
    
    if (process.env.SCRIPTIT_DEBUG === "true") {
      console.error("\n🔍 Debug Stack Trace:");
      console.error(error.stack);
    } else {
      console.error("\n💡 For more details, run with debug mode:");
      console.error("   SCRIPTIT_DEBUG=true scriptit [command]");
    }
    
    process.exit(1);
  }
}

// Execute main function
main().catch((error) => {
  console.error("❌ Fatal Error:", error.message);
  process.exit(1);
}); 