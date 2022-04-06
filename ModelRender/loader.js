import { GLTFLoader } from './three.js-master/examples/jsm/loaders/GLTFLoader.js'
import { addToScene } from './index.js'

// GLTF Loader
const loader = new GLTFLoader()
function load_gltf(gltf_path, scale_factor) {
    loader.load(gltf_path, function (gltf) {
        
        gltf.scene.scale.set(scale_factor, scale_factor, scale_factor)
        // scene.add(gltf.scene)
        
        addToScene(gltf.scene)
        

    }, function (xhr) {
        // Print percent loaded
        console.log(`${xhr.loaded / xhr.total * 100}% loaded`)
    }, function (error) {
        console.log(error)
    })
}


var x = 7
function five(){
    return x
}

export { load_gltf, five }