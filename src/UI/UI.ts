import { ActorSignals } from "../Lib/CustomEmitterManager";

export const model = {
  startRoom: () => {
    ActorSignals.emit("startRoom");
  },
  resetRoom: () => {
    ActorSignals.emit("resetRoom");
  },
};

export const template = `
<style> 
    canvas{ 
        position: fixed; 
        top:50%; 
        left:50%; 
        transform: translate(-50% , -50%);
    }
</style> 
<div> 
    <canvas id='cnv'> </canvas> 
    <button \${click @=> startRoom}>START</button>
    <button \${click @=> resetRoom}>RESET</button>
</div>`;
