import { GUI } from './node_modules/dat.gui/build/dat.gui.module.js'

const gui = new GUI()

const arr = ["one", "two", "three"]
const dir = {
    Ruby: "assets/ruby1.gltf",
    Oldman: "assets/oldman.gltf",
    Markus: "assets/Markus.gltf",
    Latifa: "assets/Latifa.gltf",
    Rin: "assets/Rin.gltf",
    Pilin: "assets/Pilin.gltf",
    Bandit: "assets/bandit.gltf",
    Bandit_without_mask: "assets/bandit_withoutmask.gltf"
}


let options = {
    avatar: dir.Ruby,
    background: "default_background.png"
}

gui.add(options, 'avatar', dir).name('Select Avatar').onChange((value) => load_gltf()) // TODO: zavolat load_gltf() 
// https://www.delftstack.com/howto/javascript/javascript-call-function-from-another-js-file/