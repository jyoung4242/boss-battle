import { Actor, ActorEvents, Engine, Entity } from "excalibur";
import { OtherComponent } from "./BossComponents";
import { Boss } from "../Actors/Boss";

export class ShieldOtherComponent extends OtherComponent {
  lifeTime = 540;
  lifeTimeTik = 0;

  constructor(public owner: Actor, public engine: Engine) {
    super(owner, engine);
  }

  onPreUpdate(event: ActorEvents["preupdate"]): void {
    if (!this.owner) {
      console.log("no owner, shield: ", this.uuid);
      return;
    }

    if (this.isTriggered && !this.isEnabled && this.coolOffTik >= this.coolOffLimit) {
      this.isEnabled = true;
      this.coolOffTik = 0;
    }
    //console.log("shield", this);

    if (this.isEnabled) {
      (this.owner as Boss).shieldChild.enableShield();
      this.lifeTimeTik++;
    } else {
      (this.owner as Boss).shieldChild.disableShield();
    }

    if (this.lifeTimeTik >= this.lifeTime) {
      this.lifeTimeTik = 0;
      this.reset();
    }

    if (!this.isEnabled) this.coolOffTik++;
  }
}
