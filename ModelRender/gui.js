import { GUI } from './node_modules/dat.gui/build/dat.gui.module.js'
import { select_avatar, select_bg, set_front_light, set_back_light } from './index.js'

const gui = new GUI()
gui.width = 300

const avatars = {
    Ruby: "assets/ruby1.gltf",
    Oldman: "assets/oldman.gltf",
    Markus: "assets/Markus.gltf",
    Latifa: "assets/Latifa.gltf",
    Rin: "assets/Rin.gltf",
    Pilin: "assets/Pilin.gltf",
    Bandit: "assets/bandit.gltf",
    Bandit_without_mask: "assets/bandit_withoutmask.gltf"
}

const backgrounds = {
    Day: "textures/bg2.png",
    Field: "textures/bg.JPG",
    Night: "textures/night_sky.png"
}

let options = {
    avatar: avatars.Ruby,
    background: backgrounds.Day,
    light_front: 1,
    light_back: 1
}

gui.add(options, 'avatar', avatars).name('Select Avatar').onChange((value) => select_avatar(value)) 
gui.add(options, 'background', backgrounds).name('Select Background').onChange((value) => select_bg(value)) 
gui.add(options, 'light_front', 0, 1).name('Front light intensity').onChange((value) => set_front_light(value))
gui.add(options, 'light_back', 0, 1).name('Back light intensity').onChange((value) => set_back_light(value))
