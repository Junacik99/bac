import * as THREE from './three.js-master/build/three.module.js'
import {GLTFLoader} from './three.js-master/examples/jsm/loaders/GLTFLoader.js'

const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()
var clock = new THREE.Clock()
var mixer
var gltfChar
var isTalking = false

// GLTF Loader
const loader = new GLTFLoader()
loader.load('assets/Markus.gltf', function(gltf){
    console.log(gltf)
    gltfChar = gltf
    scene.add(gltf.scene)

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
camera.position.set(0,1,5)
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
    if(keyCode == 32){
        // Play Animation
        mixer = new THREE.AnimationMixer(gltfChar.scene)
        const clips = gltfChar.animations
        const clip = THREE.AnimationClip.findByName( clips, 'talk_anim' )
        const action = mixer.clipAction( clip )
        if(isTalking)
            action.stop()
        else
            action.play()
        isTalking = !isTalking
    }
}
