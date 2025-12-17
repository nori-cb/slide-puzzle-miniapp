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

      // Suppress specific module not found warnings
      config.ignoreWarnings = [
        { module: /@react-native-async-storage\/async-storage/ },
        { module: /pino-pretty/ },
      ];
    }
    return config;
  },
}

module.exports = nextConfig
