module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['inline-import', { extensions: ['.sql'] }],
      // ...any other existing plugins...
      'react-native-reanimated/plugin', // must stay last
    ],
  };
};