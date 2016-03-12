/* jshint node: true */
/* jslint browser: true */
/* jslint asi: true */
'use strict'

var glClear = require('gl-clear')
var createContext = require('gl-context')
var fit = require('canvas-fit')
var Geom = require('gl-geometry')
var model = require('bunny')
var glslify = require('glslify')
var glShader = require('gl-shader')
var mat4 = require('gl-mat4')
var mat3 = require('gl-mat3')
var vec3 = require('gl-vec3')
var turntableCamera = require('turntable-camera')
var normals = require('normals')

// Canvas & WebGL setup
var canvas = document.body.appendChild(document.createElement('canvas'))
window.addEventListener('resize', fit(canvas), false)
var gl = createContext(canvas, render)
var clear = glClear({color: [ 0, 0, 0, 1 ], depth: true})
gl.enable(gl.DEPTH_TEST)

// Set up model
var norms = normals.vertexNormals(model.cells, model.positions)
var geom = Geom(gl).attr('MCVertex', model.positions).attr('MCNormal', norms).faces(model.cells)

// Hemisphere lighting shader
var shader = glShader(gl, glslify('./hemisphere.vs'), glslify('./hemisphere.fs'))

// Projection and camera setup
var PMatrix = mat4.create()
var camera = turntableCamera()
camera.downwards = Math.PI * 0.2

// Main loop
function render () {
  var width = canvas.width
  var height = canvas.height

  gl.viewport(0, 0, width, height)
  clear(gl)

  mat4.perspective(PMatrix, Math.PI / 4, width / height, 0.001, 1000)

  // Update camera rotation angle
  camera.rotation = Date.now() * 0.0002

  // Model matrix is ID here
  var VMatrix = camera.view()
  var MVMatrix = VMatrix // * ID
  var MVPMatrix = mat4.create()
  mat4.multiply(MVPMatrix, PMatrix, MVMatrix)

  geom.bind(shader)
  shader.uniforms.MVMatrix = MVMatrix
  shader.uniforms.MVPMatrix = MVPMatrix
  shader.uniforms.NormalMatrix = computeNormalMatrix(MVMatrix)
  shader.uniforms.LightPosition = vec3.fromValues(0.0, 10.0, 0.0)
  shader.uniforms.SkyColor = vec3.fromValues(0.0, 0.0, 0.8)
  shader.uniforms.GroundColor = vec3.fromValues(0.6, 0.6, 0.2)
  geom.draw()
}

function computeNormalMatrix (MVMatrix) {
  var topLeft = mat3.create()
  mat3.fromMat4(topLeft, MVMatrix)

  var inv = mat3.create()
  mat3.invert(inv, topLeft)

  var normalMatrix = mat3.create()
  mat3.transpose(normalMatrix, inv)
  return normalMatrix
}
