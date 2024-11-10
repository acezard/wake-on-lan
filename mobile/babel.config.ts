export default function (api: any) {
  api.cache(true); // Keep this for caching purposes
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          safe: false,
          allowUndefined: true,
        }
      ]
    ]
  };
}
