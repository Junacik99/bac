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

///////////////////////////////////////////////////////
// WebSocket
let socket = new WebSocket("ws://127.0.0.1:8765");

socket.onopen = function(e) {
    console.log('Connection to ws server established')
    // socket.send("My name is John");
};

socket.onmessage = function(event) {
  //alert(`[message] Data received from server: ${event.data}`);
  console.log(`${event.data}`)
  gap = parseFloat(event.data)
  scene.traverse(function (object) {
    if (object.isMesh) {
        object.skeleton.getBoneByName("Bip001_Jaw_081").rotation.x = baseRot + gap*4
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
loader.load('assets/ruby.gltf', function(gltf){
    gltfChar = gltf
    gltf.scene.scale.set(0.1,0.1,0.1)
    scene.add(gltf.scene)

    mixer = new THREE.AnimationMixer(gltfChar.scene)
    clips = gltfChar.animations

    scene.traverse(function (object) {
        if (object.isMesh) {
            baseRot = object.skeleton.getBoneByName("Bip001_Jaw_081").rotation.x
        }
    });

}, function(xhr){
    //console.log(`${xhr.loaded / xhr.total * 100}% loaded`)
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
camera.position.set(0,15,5)
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
                console.log(object.skeleton.getBoneByName("Bip001_Jaw_081").rotation.x)
            }
        });
        isTalking = !isTalking
    }

    // Rotate Head
    if(keyCode == rightArrowKey){
        scene.traverse(function (object) {
            if (object.isMesh) {
                object.skeleton.getBoneByName("Bip001_Head_011").rotation.z += 0.01
            }
        });
    }
    if(keyCode == leftArrowKey){
        scene.traverse(function (object) {
            if (object.isMesh) {
                //object.skeleton.bones[1].rotation.y -= 0.1
                object.skeleton.getBoneByName("Bip001_Head_011").rotation.z -= 0.01
            }
        });
    }

    // Camera Up/Down
    if(keyCode == upKey)
        camera.position.y += 0.5
    if(keyCode == downKey)
        camera.position.y -= 0.5
}

