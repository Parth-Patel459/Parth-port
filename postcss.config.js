module.exports = {
  plugins: [
    require('postcss-import'),
    require('postcss-preset-env')({
      stage: 1,
      features: {
        'nesting-rules': true,
        'custom-properties': true,
        'custom-media-queries': true,
        'color-mod-function': true
      }
    }),
    require('autoprefixer'),
    require('cssnano')({
      preset: 'default'
    })
  ]
} 