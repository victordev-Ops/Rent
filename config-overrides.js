const webpack = require("webpack");

module.exports = function override(config) {
  config.resolve.fallback = {
    stream: require.resolve("stream-browserify"),
    assert: require.resolve("assert"),
    url: require.resolve("url/"),
    https: require.resolve("https-browserify"),
    http: require.resolve("stream-http"),
    os: require.resolve("os-browserify/browser"),
    buffer: require.resolve("buffer"),
    util: require.resolve("util"),
    process: require.resolve("process/browser"),
  };

  config.plugins.push(
    new webpack.ProvidePlugin({
      process: "process/browser",
      Buffer: ["buffer", "Buffer"],
    })
  );

  return config;
};
