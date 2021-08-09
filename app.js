// app.js
var tf = require('@tensorflow/tfjs-core');
var webgl = require('@tensorflow/tfjs-backend-webgl');
var cpu = require('@tensorflow/tfjs-backend-cpu');
var tfjs = requirePlugin('tfjsPlugin');
var fetchWechat = require('fetch-wechat');

App({
  onLaunch() {
    tfjs.configPlugin({
      fetchFunc: fetchWechat.fetchFunc(),
      tf, webgl, cpu, canvas: wx.createOffscreenCanvas()
    });
  }
})
