import * as THREE from './three.js-master/build/three.module.js'
import {GLTFLoader} from './three.js-master/examples/jsm/loaders/GLTFLoader.js'

const canvas = document.querySelector('.webgl')
const scene = new THREE.Scene()
var clock = new THREE.Clock()
var mixer

// GLTF Loader
const loader = new GLTFLoader()
loader.load('assets/chest00.gltf', function(gltf){
    console.log(gltf)
    const chest = gltf.scene
    scene.add(chest)

    // Play Animation
    mixer = new THREE.AnimationMixer(chest)
    const clips = gltf.animations
    const clip = THREE.AnimationClip.findByName( clips, 'OpenAnim' )
    const action = mixer.clipAction( clip )
    action.play()

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

