import * as TOOLS from './components/tools.class.js'
import GamePadController from './components/gamepadControler'

var framecounter = new TOOLS.FrameRateUI()
let controler = new GamePadController()

// start animating
animate();


function animate() {
    requestAnimationFrame(animate);

    // Updating components
    framecounter.update()
    controler.update()

}

// console.log("YO !");
