import { GUI } from './node_modules/dat.gui/build/dat.gui.module.js'
import { select_avatar } from './index.js'

const gui = new GUI()
gui.width = 300

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

gui.add(options, 'avatar', dir).name('Select Avatar').onChange((value) => select_avatar(value)) 
