class GamePadController {
    constructor(){
        this.active = false
        this.init()
    }

    init(){
        window.addEventListener("gamepadconnected", (e)=>{
            console.log('Controler USB Connected')
            this.active = true
        })
    }

    buttonPressed(b) {
        if (typeof (b) == "object") {
            return b.pressed;
        }
        return b == 1.0;
    }

    update(){

        if (!this.active) return
        let gamepads = navigator.getGamepads();
        if (!gamepads) return
        var gp = gamepads[0]        
        if (this.buttonPressed(gp.buttons[3])) {
            console.log('yo')  
            document.body.style.backgroundColor = 'red' 
        } else {
            document.body.style.backgroundColor = 'white' 
        }

    }
}
export default GamePadController
