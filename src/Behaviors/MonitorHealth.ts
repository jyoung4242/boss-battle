import { ActorEvents, Engine } from "excalibur";
import { Boss } from "../Actors/Boss";
import { ActorSignals } from "../Lib/CustomEmitterManager";
import { MonitorComponent } from "../Components/BossComponents";

export interface MonitorHealthConfig {
  setPoint: number;
  setPoint2: number;
}

export class MonitorHealth extends MonitorComponent {
  sp1: number = 0;
  sp2: number = 0;

  isSP1Triggered: boolean = false;
  isSP2Triggered: boolean = false;

  constructor(public owner: Boss, public engine: Engine, public config: MonitorHealthConfig) {
    super(owner, engine);
    this.sp1 = config.setPoint;
    this.sp2 = config.setPoint2;
  }

  onAdd(): void {
    this.owner.on("preupdate", this.onPreUpdate.bind(this));
  }

  onPreUpdate(event: ActorEvents["preupdate"]): void {
    const healthPercentage = this.owner.hp / this.owner.maxHp;

    //console.log("monitoring: ", healthPercentage, this.owner.hp, this.owner.maxHp);

    if (healthPercentage <= this.sp1 && !this.isSP1Triggered) {
      ActorSignals.emit("bossSP1Triggered");
      this.isSP1Triggered = true;
    }

    if (healthPercentage <= this.sp2 && !this.isSP2Triggered) {
      ActorSignals.emit("bossSP2Triggered");
      this.isSP2Triggered = true;
    }
  }
}
