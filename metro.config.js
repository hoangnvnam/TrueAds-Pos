// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

// Lấy cấu hình mặc định từ Expo
const defaultConfig = getDefaultConfig(__dirname);

// Thêm cấu hình resolver cho assets
defaultConfig.resolver.assetExts = [
  ...defaultConfig.resolver.assetExts,
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'
];

// Áp dụng cấu hình Reanimated
module.exports = wrapWithReanimatedMetroConfig(defaultConfig);