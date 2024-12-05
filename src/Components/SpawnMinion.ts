import { Actor, ActorEvents, Engine, Entity, Random, Util } from "excalibur";
import { OtherComponent } from "./BossComponents";
import { Boss } from "../Actors/Boss";

export class SpawnOtherComponent extends OtherComponent {
  coolOffLimit: number = 900;
  numMinions: number = 1;
  minionCount: number = 0;
  spawnCoolOff: number = 0;
  spawnCoolOffLimit: number = 60;

  rng: Random = new Random();

  constructor(public owner: Boss, public engine: Engine) {
    super(owner, engine);
  }

  async onPreUpdate(event: ActorEvents["preupdate"]): Promise<void> {
    if (!this.owner) {
      console.log("no owner, spawn: ", this.uuid);
      return;
    }
    //console.log("heal preupdate", this.isTriggered, this.isEnabled, this.coolOffTik, this.coolOffLimit);
    if (this.isTriggered && !this.isEnabled && this.coolOffTik >= this.coolOffLimit) {
      this.isEnabled = true;
      this.coolOffTik = 0;
      this.numMinions = this.rng.integer(5, 10);
      this.minionCount = 0;
    }

    if (this.isEnabled) {
      this.spawnCoolOff++;

      if (this.spawnCoolOff >= this.spawnCoolOffLimit) {
        this.spawnCoolOff = 0;
        this.owner.spawnMinion();
        this.minionCount++;
      }

      if (this.minionCount >= this.numMinions) {
        this.reset();
      }
    } else {
      //notSpawning
    }

    if (!this.isEnabled) this.coolOffTik++;
  }
}
