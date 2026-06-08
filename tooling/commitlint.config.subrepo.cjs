/** Commitlint for sub-repos: use Meta tooling when present, else conventional defaults. */
const fs = require('node:fs');
const path = require('node:path');

const toolingConfig = path.join(__dirname, 'commitlint.config.cjs');

module.exports = fs.existsSync(toolingConfig)
  ? require(toolingConfig)
  : { extends: ['@commitlint/config-conventional'] };
