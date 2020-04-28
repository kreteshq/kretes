const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

module.exports = {
  transformers: [
    tailwindcss('./config/tailwind.config.js'),
    autoprefixer,
  ]
};
