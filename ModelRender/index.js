/**********************
*    Martin Takács    *
*       xtakac07      *
*    Avatar animator  *
*        script       *
************************/ 

import * as THREE from './three.js-master/build/three.module.js'
import {GLTFLoader} from './three.js-master/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from './three.js-master/examples/jsm/controls/OrbitControls.js'

const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()
var clock = new THREE.Clock()
var mixer, gltfChar
// let clips
// var isTalking = false
let base_jaw_rot
let base_blink_L, base_blink_R
// var gap = 0.0

var gltf_path = 'assets/ruby1.gltf'
const bgtexture_path = 'textures/bg2.png'

let scale_factor 
let bone_jaw, bone_head, bone_eye_L, bone_eye_R, bone_eyelid_L, bone_eyelid_R
let jaw_mul, hrot_mul, hnod_mul, hturn_mul, eye_L_H_mul, eye_L_V_mul, eye_R_H_mul, eye_R_V_mul
let hrot_off, hnod_off, hturn_off, eye_L_H_off, eye_L_V_off, eye_R_H_off, eye_R_V_off
let axis_eye_H, axis_eye_V
var camera_position = { // TODO: maybe let?
    x: 0,
    y: 0,
    z: 0
}
let camera_offsetY
  

///////////////////////////////////////////////////////
// WebSocket
const ws_address = "ws://127.0.0.1:8765"
let socket = new WebSocket(ws_address);

socket.onopen = function(e) {
    console.log('Connection to ws server established')
    // socket.send("message to reply to server");
};

socket.onmessage = function(event) {
    // console.log(`${event.data}`)
  let msg = JSON.parse(event.data)

  // Transform object (Move)
  // TODO: scene.traverse a object.isMesh su zrejme nepodstatne
  scene.traverse(function (object) {

    if (object.isMesh) {
        // Jaw
        if (bone_jaw != null){
            scene.getObjectByName(bone_jaw).rotation.x = base_jaw_rot + msg.gap*jaw_mul
        }

        // Head
        if (bone_head != null){
            scene.getObjectByName(bone_head).rotation.z = msg.rot * hrot_mul + hrot_off
            scene.getObjectByName(bone_head).rotation.x = msg.nod * hnod_mul + hnod_off
            scene.getObjectByName(bone_head).rotation.y = msg.turn * hturn_mul + hturn_off
        }

        // Irises
        // TODO: move eyes separately
        // TODO: offsets
        if (bone_eye_L != null && bone_eye_R != null){
            if (axis_eye_H == "z"){
                scene.getObjectByName(bone_eye_L).rotation.z = msg.eye_L_H * eye_L_H_mul + eye_L_H_off
                scene.getObjectByName(bone_eye_R).rotation.z = msg.eye_R_H * eye_R_H_mul + eye_R_H_off
            }
            else if (axis_eye_H == "y"){
                scene.getObjectByName(bone_eye_L).rotation.y = msg.eye_L_H * eye_L_H_mul + eye_L_H_off
                scene.getObjectByName(bone_eye_R).rotation.y = msg.eye_R_H * eye_R_H_mul + eye_R_H_off
            }
            scene.getObjectByName(bone_eye_L).rotation.x = msg.eye_L_V * eye_L_V_mul + eye_L_V_off
            scene.getObjectByName(bone_eye_R).rotation.x = msg.eye_R_V * eye_R_V_mul + eye_R_V_off
        }

        // Blink
        let blink_treshold = 0.27
        if (bone_eyelid_L != null){
            if (msg.blinkL < blink_treshold) // then blink left
                scene.getObjectByName(bone_eyelid_L).rotation.x = 3.7
            else
                scene.getObjectByName(bone_eyelid_L).rotation.x = base_blink_L
        }
        if (bone_eyelid_R != null){
            if (msg.blinkR < blink_treshold) // then blink right
                scene.getObjectByName(bone_eyelid_R).rotation.x = 0.5
            else
                scene.getObjectByName(bone_eyelid_R).rotation.x = base_blink_R
        }
        
    }
});
};

socket.onclose = function(event) {
  if (event.wasClean) {
    alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    alert('[close] Connection died');
  }
};

socket.onerror = function(error) {
  alert(`[error] ${error.message}`);
};

// Read config json
let config
function load_config(){
function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest()
    rawFile.overrideMimeType("application/json")
    rawFile.open("GET", file, true)
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200")
            callback(rawFile.responseText)
    }
    rawFile.send(null);
}
const conf_re = /.*assets\/(.+)\.gltf/g
const model_name = conf_re.exec(gltf_path)[1]
readTextFile(`configs/${model_name}.json`, function(text){
    config = JSON.parse(text)
    console.log(config)

    // Set bones
    bone_jaw = config.bones.bone_jaw
    bone_head = config.bones.bone_head
    bone_eye_L = config.bones.bone_eye_L
    bone_eye_R = config.bones.bone_eye_R
    bone_eyelid_L = config.bones.bone_eyelid_L
    bone_eyelid_R = config.bones.bone_eyelid_R

    // Multipliers
    jaw_mul = config.bones.multipliers.jaw
    hrot_mul = config.bones.multipliers.head_rot
    hnod_mul = config.bones.multipliers.head_nod
    hturn_mul = config.bones.multipliers.head_turn
    eye_L_H_mul = config.bones.multipliers.eye_L_H
    eye_L_V_mul = config.bones.multipliers.eye_L_V
    eye_R_H_mul = config.bones.multipliers.eye_R_H
    eye_R_V_mul = config.bones.multipliers.eye_R_V

    // Offsets
    hrot_off = config.bones.offsets.head_rot
    hnod_off = config.bones.offsets.head_nod
    hturn_off = config.bones.offsets.head_turn
    eye_L_H_off = config.bones.offsets.eye_L_H
    eye_L_V_off = config.bones.offsets.eye_L_V
    eye_R_H_off = config.bones.offsets.eye_R_H
    eye_R_V_off = config.bones.offsets.eye_R_V

    // Axis
    if (config.bones.axis != null) {
        axis_eye_H = config.bones.axis.eye_H
        axis_eye_V = config.bones.axis.eye_V
    }

    // Scaling factor
    scale_factor = config.scale_factor

    // Camera position
    camera.position.set(config.camera_position.x,
        config.camera_position.y,
        config.camera_position.z)
    camera_offsetY = config.camera_offsetY
});
}
load_config()

// GLTF Loader
const loader = new GLTFLoader()
function load_gltf(){
loader.load(gltf_path, function(gltf){
    gltfChar = gltf
    gltf.scene.scale.set(scale_factor,scale_factor,scale_factor)
    scene.add(gltf.scene)

    // mixer = new THREE.AnimationMixer(gltfChar.scene)
    // clips = gltfChar.animations

    scene.traverse(function (object) {
        if (object.isMesh) {
            // set base transforms
            if (bone_jaw != null)
                base_jaw_rot = scene.getObjectByName(bone_jaw).rotation.x
            if (bone_eyelid_L != null)
                base_blink_L = scene.getObjectByName(bone_eyelid_L).rotation.x
            if (bone_eyelid_R != null)
                base_blink_R = scene.getObjectByName(bone_eyelid_R).rotation.x
        }
    });

    console.log(scene.getObjectByName(bone_eye_L).rotation)
    console.log(scene.getObjectByName(bone_eye_R).rotation)

    // Set camera to look at avatar's head
    var target = scene.getObjectByName(bone_head).position
    controls.target = new THREE.Vector3(target.x, target.y + camera_offsetY, target.z)

}, function(xhr){
    // Print percent loaded
    // console.log(`${xhr.loaded / xhr.total * 100}% loaded`)
}, function(error){
    console.log(error)
})
}
load_gltf()


// Select Avatar
function select_avatar(avatar_path){
    gltf_path = avatar_path
    scene.remove(gltfChar.scene)
    load_gltf()
    load_config()
}

// Background
const texture_loader = new THREE.TextureLoader()
var bgTexture = texture_loader.load(bgtexture_path)
scene.background = bgTexture
function select_bg(bg_path){
    bgTexture = texture_loader.load(bg_path)
    scene.background = bgTexture
}

// Light
var light_front = new THREE.DirectionalLight('white', 1)
light_front.position.set(2,2,5)
scene.add(light_front)
var light_back = new THREE.DirectionalLight('white', 1)
light_back.position.set(2,2,-5)
scene.add(light_back)
function set_front_light(intensity){
    light_front.intensity = intensity
}
function set_back_light(intensity){
    light_back.intensity = intensity
}

// Window sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width/sizes.height, 0.1, 100)
camera.position.set(camera_position.x, camera_position.y, camera_position.z)
scene.add(camera)


// Renderer
const renderer = new THREE.WebGL1Renderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

// Camera Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.update()


function animate(){
    requestAnimationFrame(animate)
    var delta = clock.getDelta()
    if(mixer)
        mixer.update(delta)
    controls.update()
    renderer.render(scene, camera)
}

animate()



// onKeyDown
document.addEventListener("keydown", onDocumentKeyDown, false)
function onDocumentKeyDown(event) {
    var keyCode = event.which
    const spaceKey = 32
    const rightArrowKey = 39
    const leftArrowKey = 37
    const upKey = 38
    const downKey = 40
    const w=87, a=65, s=83, d=68,
    c = 67

    if (keyCode == a)
        scene.getObjectByName(bone_eye_R).rotation.z -= 0.2
    if (keyCode == d)
        scene.getObjectByName(bone_eye_R).rotation.z += 0.2
    if (keyCode == w)
        scene.getObjectByName(bone_eye_R).rotation.x += 0.2
    if (keyCode == s)
        scene.getObjectByName(bone_eye_R).rotation.x -= 0.2

    if (keyCode == c) {
        console.log(camera.position)
    }

    if (keyCode == spaceKey){
        // Play Animation
        
        const clip_open = THREE.AnimationClip.findByName( clips, 'openMouth' )
        const action_open = mixer.clipAction( clip_open )
        const clip_closed = THREE.AnimationClip.findByName( clips, 'closedMouth' )
        const action_closed = mixer.clipAction( clip_closed )
        if (!isTalking){
            action_open.stop()
            action_closed.crossFadeTo(action_open, 0.5, false).play()
        }
        else {
            action_closed.stop()
            action_open.crossFadeTo(action_closed, 0.5, false).play()
        }
        scene.traverse(function (object) {
            if (object.isMesh) {
                console.log(object.skeleton.getBoneByName(bone_jaw).rotation.x)
            }
        });
        isTalking = !isTalking
    }

    // Rotate Head
    if (keyCode == rightArrowKey){
        scene.traverse(function (object) {
            if (object.isMesh) {
                object.skeleton.getBoneByName(bone_head).rotation.z += 0.01
            }
        });
    }
    if (keyCode == leftArrowKey){
        scene.traverse(function (object) {
            if (object.isMesh) {
                //object.skeleton.bones[1].rotation.y -= 0.1
                object.skeleton.getBoneByName(bone_head).rotation.z -= 0.01
            }
        });
    }



    // Camera Up/Down
    if (keyCode == upKey)
        camera.position.y += 0.5
    if (keyCode == downKey)
        camera.position.y -= 0.5
}

export { select_avatar, select_bg, set_front_light, set_back_light }