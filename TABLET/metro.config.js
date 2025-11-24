const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for export:embed error
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    }
  }
};

config.resolver = {
  ...config.resolver,
  assetExts: [...config.resolver.assetExts, 'db', 'mp3', 'ttf', 'obj', 'png', 'jpg'],
  sourceExts: [...config.resolver.sourceExts, 'js', 'jsx', 'ts', 'tsx', 'json']
};

module.exports = config;