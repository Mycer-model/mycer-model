// Theme comes from the design tokens (replica/jenni/design/tailwind.tokens.js): classes like bg-surface text-muted.
module.exports = {
  presets: [require('../../replica/jenni/design/tailwind.tokens.js')],
  content: ['./src/**/*.{ts,tsx}'],
};
