module.exports = {
  content: ['./src/**/*.svelte', './src/**/*.html'],
  css: ['./src/app.css'],
  output: './src/app.purged.css',
  extractors: [
    {
      extractor: require('purgecss-from-svelte'),
      extensions: ['svelte', 'html'],
    },
  ],
};