const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add resolver configuration to handle missing files
config.resolver.platforms = ["ios", "android", "native", "web"];

// Configure source extensions
config.resolver.sourceExts = ["js", "jsx", "json", "ts", "tsx"];

// Add resolver for missing files
config.resolver.resolverMainFields = ["react-native", "browser", "main"];

// Configure transformer to handle missing files gracefully
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Add resolver for missing InternalBytecode.js
config.resolver.resolverMainFields = ["react-native", "browser", "main"];

module.exports = config;
