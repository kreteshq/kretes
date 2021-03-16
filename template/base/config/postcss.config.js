const tailwindcss = require('tailwindcss');
const tailwindcssjit = require('@tailwindcss/jit');
const autoprefixer = require('autoprefixer');

module.exports = {
  plugins: [
    tailwindcssjit('./config/tailwind.config.js'),
    autoprefixer,
  ]
};
