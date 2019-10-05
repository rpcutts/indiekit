module.exports = ({
  plugins: [
    require('postcss-easy-import'),
    require('postcss-custom-media'),
    require('postcss-custom-selectors'),
    require('postcss-extend-rule'),
    require('postcss-media-minmax')
  ]
});
