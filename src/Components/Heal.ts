import { Actor, ActorEvents, Color, Engine, Entity } from "excalibur";
import { OtherComponent } from "./BossComponents";
import { Boss } from "../Actors/Boss";

export class HealOtherComponent extends OtherComponent {
  lifeTime = 25;
  lifeTimeTik = 0;
  coolOffLimit: number = 1200;

  constructor(public owner: Boss, public engine: Engine) {
    super(owner, engine);
    this.lifeTime = this.owner.maxHp / 5;
  }

  onAdd(): void {
    this.owner.on("preupdate", this.onPreUpdate.bind(this));
  }

  onPreUpdate(event: ActorEvents["preupdate"]): void {
    if (!this.owner) {
      console.log("no owner, heal: ", this.uuid);
      return;
    }
    //console.log("heal preupdate", this.isTriggered, this.isEnabled, this.coolOffTik, this.coolOffLimit);
    if (this.isTriggered && !this.isEnabled && this.coolOffTik >= this.coolOffLimit) {
      this.isEnabled = true;
      this.coolOffTik = 0;
    }
    //console.log("heal", this);
    if (this.isEnabled) {
      //isHealing
      this.lifeTimeTik++;

      if ((this.owner as Boss).hp < (this.owner as Boss).maxHp) {
        (this.owner as Boss).color = Color.Green;
        (this.owner as Boss).hp++;
      }
    } else {
      //notHealing
      (this.owner as Boss).color = Color.Magenta;
    }

    if (this.lifeTimeTik >= this.lifeTime) {
      this.lifeTimeTik = 0;
      this.reset();
    }

    if (!this.isEnabled) this.coolOffTik++;
  }
}
