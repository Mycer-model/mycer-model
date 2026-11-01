const tokens = require('./tailwind.tokens.js');
module.exports = { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: tokens.theme, plugins: [] };
