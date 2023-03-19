module.exports = function(api) {
  api.cache(true);
  return {
    "ignore": [new RegExp("d3-array/dist/d3-array.js")],
    "presets": ['babel-preset-expo', 'module:metro-react-native-babel-preset'],
    "plugins": [
      [
        "module-resolver",
        {
          "root": ["./src"],
          "extensions": [".js", ".ios.js", ".android.js", ".ts", ".tsx", ".json", ".png", ".db", ".csv"],
          "alias": {
            "@": "./src",
            "#": "./assets",
          },
        },
        "babel-plugin-styled-components",
      ]
    ],
  };
};
