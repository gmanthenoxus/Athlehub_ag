const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Resolver configuration to handle Node.js modules and exclude problematic packages
config.resolver = {
  ...config.resolver,
  alias: {
    crypto: 'react-native-crypto',
    stream: 'stream-browserify',
    buffer: '@craftzdog/react-native-buffer',
  },
  platforms: ['native', 'android', 'ios'],
  // Exclude WebSocket and other Node.js specific modules
  blockList: [
    /node_modules\/ws\/.*/,
    /node_modules\/bufferutil\/.*/,
    /node_modules\/utf-8-validate\/.*/,
  ],
};

module.exports = config;
