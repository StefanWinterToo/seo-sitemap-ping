#!/usr/bin/env node

// This is the CLI entry point that loads the compiled CLI module
const { main } = require('../dist/cjs/cli.js');

const args = process.argv.slice(2);

main(args)
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error('Fatal error:', error.message);
    process.exit(1);
  });
