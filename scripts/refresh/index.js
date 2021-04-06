const path = require('path');

const plugin = (snowpackConfig, _pluginOptions) => {
  const appCssPath = path.join(snowpackConfig.root || process.cwd(), 'stylesheets/main.css');
  return {
    name: '@snowpack/myrefresh',
    onChange({filePath}) {
      console.log('changed', filePath)
      if (!filePath.endsWith('.tsx')) {
        return;
      }
      this.markChanged(appCssPath);
    },
  };
};

module.exports = plugin
