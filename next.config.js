/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ignore React Native dependencies that are not needed in browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
        'pino-pretty': false,
      };

      // Use IgnorePlugin to suppress module not found errors
      const webpack = require('webpack');
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /@react-native-async-storage\/async-storage/,
        }),
        new webpack.IgnorePlugin({
          resourceRegExp: /pino-pretty/,
        })
      );
    }
    return config;
  },
}

module.exports = nextConfig
