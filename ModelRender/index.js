import * as THREE from './three.js-master/build/three.module.js'
import {GLTFLoader} from './three.js-master/examples/jsm/loaders/GLTFLoader.js'

const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()
var clock = new THREE.Clock()
var mixer, gltfChar
let clips
var isTalking = false
let baseRot
var gap = 0.0
const gltf_name = 'assets/ruby1.gltf'
const bone_jaw = "Bip001_Jaw_081" // Name of the jaw bone in gltf (mouth open)
const bone_head = "Bip001_Head_011" // Name of the head bone (rotate head)
const bone_eye_L = "Bip001_Eye_L_0123" // Irises
const bone_eye_R = "Bip001_Eye_R_0124"
const bone_eyelid_L = "Bip001_EyelidUp_L_0125"
const bone_eyelid_R = "Bip001_EyelidUp_R_0129"
let base_blink_L
let base_blink_R
let base_eye_H_L
let base_eye_H_R

///////////////////////////////////////////////////////
// WebSocket
let socket = new WebSocket("ws://127.0.0.1:8765");

socket.onopen = function(e) {
    console.log('Connection to ws server established')
    // socket.send("My name is John");
};

socket.onmessage = function(event) {
  //alert(`[message] Data received from server: ${event.data}`);
//   console.log(`${event.data}`)
  let msg = JSON.parse(event.data)
  gap = msg.gap

  // Transform object
  scene.traverse(function (object) {
    if (object.isMesh) {
        object.skeleton.getBoneByName(bone_jaw).rotation.x = baseRot + gap*6

        object.skeleton.getBoneByName(bone_head).rotation.z = msg.rot * 2 - 3.14159
        object.skeleton.getBoneByName(bone_head).rotation.x = msg.nod * 5 + 0.3
        object.skeleton.getBoneByName(bone_head).rotation.y = msg.turn * 5

        object.skeleton.getBoneByName(bone_eye_L).rotation.z = msg.eye_L_H + 1
        object.skeleton.getBoneByName(bone_eye_R).rotation.z = msg.eye_R_H + 1
        object.skeleton.getBoneByName(bone_eye_L).rotation.x = msg.eye_L_V + 1
        object.skeleton.getBoneByName(bone_eye_R).rotation.x = msg.eye_R_V + 1

        if(msg.blinkL < 0.27) // then blink left
            object.skeleton.getBoneByName(bone_eyelid_L).rotation.x = 3.7
        else
            object.skeleton.getBoneByName(bone_eyelid_L).rotation.x = base_blink_L
        if(msg.blinkR < 0.27) // then blink right
            object.skeleton.getBoneByName(bone_eyelid_R).rotation.x = 0.5
        else
            object.skeleton.getBoneByName(bone_eyelid_R).rotation.x = base_blink_R

        
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



// GLTF Loader
const loader = new GLTFLoader()
loader.load(gltf_name, function(gltf){
    gltfChar = gltf
    gltf.scene.scale.set(0.1,0.1,0.1)
    scene.add(gltf.scene)

    mixer = new THREE.AnimationMixer(gltfChar.scene)
    clips = gltfChar.animations

    scene.traverse(function (object) {
        if (object.isMesh) {
            // set base transforms
            baseRot = object.skeleton.getBoneByName(bone_jaw).rotation.x
            base_blink_L = object.skeleton.getBoneByName(bone_eyelid_L).rotation.x
            base_blink_R = object.skeleton.getBoneByName(bone_eyelid_R).rotation.x
            let eye_L = object.skeleton.getBoneByName(bone_eye_L).rotation.z
            let eye_R = object.skeleton.getBoneByName(bone_eye_R).rotation.z

            console.log(`L: ${eye_L}, R: ${eye_R}`)
        }
    });

}, function(xhr){
    console.log(`${xhr.loaded / xhr.total * 100}% loaded`)
}, function(error){
    console.log(error)
})

// Light
const light = new THREE.DirectionalLight('white', 1)
light.position.set(2,2,5)
scene.add(light)

// Window sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width/sizes.height, 0.1, 100)
camera.position.set(-1,15,5)
scene.add(camera)

// Renderer
const renderer = new THREE.WebGL1Renderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true


function animate(){
    requestAnimationFrame(animate)
    var delta = clock.getDelta()
    if(mixer)
        mixer.update(delta)
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

    if(keyCode == spaceKey){
        // Play Animation
        
        const clip_open = THREE.AnimationClip.findByName( clips, 'openMouth' )
        const action_open = mixer.clipAction( clip_open )
        const clip_closed = THREE.AnimationClip.findByName( clips, 'closedMouth' )
        const action_closed = mixer.clipAction( clip_closed )
        if(!isTalking){
            action_open.stop()
            action_closed.crossFadeTo(action_open, 0.5, false).play()
        }
        else{
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
    if(keyCode == rightArrowKey){
        scene.traverse(function (object) {
            if (object.isMesh) {
                object.skeleton.getBoneByName(bone_head).rotation.z += 0.01
            }
        });
    }
    if(keyCode == leftArrowKey){
        scene.traverse(function (object) {
            if (object.isMesh) {
                //object.skeleton.bones[1].rotation.y -= 0.1
                object.skeleton.getBoneByName(bone_head).rotation.z -= 0.01
            }
        });
    }

    // Camera Up/Down
    if(keyCode == upKey)
        camera.position.y += 0.5
    if(keyCode == downKey)
        camera.position.y -= 0.5
}

