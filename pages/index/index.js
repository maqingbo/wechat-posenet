// index.js
const posenet = require('@tensorflow-models/posenet')
const tf = require('@tensorflow/tfjs-core')
const regeneratorRuntime = require('regenerator-runtime')

Page({
  async onReady () {
    let camera = wx.createCameraContext(this);
    this.canvas = wx.createCanvasContext('pose', this);
    // 加载模型
    this.loadPoseNet()
    let count = 0
    // 监测视频的帧，传递给模型
    const listener = camera.onCameraFrame((frame) => {
      count++
      if (count === 10) {
        if (this.net) {
          this.drawPose(frame)
          // console.log(frame.data)
        }
        count = 0
      }
    })
    listener.start()
  },
  async loadPoseNet () {
    this.net = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: 193,
      multiplier: 0.5,
      modelUrl: 'https://www.gstaticcnapps.cn//tfjs-models/savedmodel/posenet/mobilenet/float/050/model-stride16.json'
    })
  },
  async detectPose (frame, net) {
    const data = new Uint8Array(frame.data)
    const imgData = { data, width: frame.width, height: frame.height }
    const imgSlice = tf.tidy(() => {
      return tf.browser.fromPixels(imgData, 3)
    })
    const pose = await net.estimateSinglePose(imgSlice, { flipHorizontal: false })
    imgSlice.dispose()
    return pose
  },
  async drawPose (frame) {
    const pose = await this.detectPose(frame, this.net)
    if (pose === null || this.canvas === null) return
    if (pose.score >= 0.3) {
      // Draw circles
      for (const key in pose.keypoints) {
        const point = pose.keypoints[key]
        if (point.score >= 0.5) {
          // console.log('point.position:', point.position)
          const {x, y} = point.position
          this.drawCircle(this.canvas, x, y)
        }
      }
      // Draw lines
      const adjacentKeyPoints = posenet.getAdjacentKeyPoints(pose.keypoints, 0.5)
      for (const key in adjacentKeyPoints) {
        const points = adjacentKeyPoints[key]
        this.drawLine(this.canvas, points[0].position, points[1].position)
      }
      this.canvas.draw()
    }
  },
  drawCircle (canvas, x, y) {
    canvas.beginPath()
    canvas.arc(x * 0.72, y * 0.9, 3, 0, 2 * Math.PI)
    canvas.fillStyle = 'aqua'
    canvas.fill()
  },
  drawLine (canvas, pon0, pon1) {
    canvas.beginPath()
    canvas.moveTo(pon0.x * 0.72, pon0.y * 0.9)
    canvas.lineTo(pon1.x * 0.72, pon1.y * 0.9)
    canvas.lineWidth = 2
    canvas.strokeStyle = 'aqua'
    canvas.stroke()
  }
})
