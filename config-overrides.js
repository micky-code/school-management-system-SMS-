module.exports = function override(config, env) {
  // Disable ESLint plugin
  config.plugins = config.plugins.filter(plugin => 
    plugin.constructor.name !== 'ESLintWebpackPlugin'
  );
  
  return config;
};
