import { Actor, ActorEvents, Vector, Engine, ActionCompleteEvent, Random, Entity, MoveTo, Subscription } from "excalibur";
import { MoveComponent, MoveComponentConfig } from "./BossComponents";
import { Boss } from "../Actors/Boss";

export class RandomRoom extends MoveComponent {
  rng: Random = new Random();
  nextPosition: Vector = Vector.Zero;
  handler: any;
  duration: number = 0;

  constructor(public owner: Actor, public engine: Engine, config: MoveComponentConfig) {
    super(owner, engine, config);
    if (config.duration) this.duration = config.duration;
    else this.duration = 0;

    this.handler = this.owner.on("actioncomplete", (event: ActionCompleteEvent) => {
      if (event.action instanceof MoveTo) this.moveToNextRotation();
    });

    this.moveToNextRotation();
  }

  moveToNextRotation() {
    if (!(this.owner as Boss)) {
      console.log("no boss, random room: ", this.uuid);
      return;
    }
    let margins = {
      leftwidth: 5,
      rightwidth: 800 - this.owner.width - 5,
      topheight: 5,
      bottomheight: 600 - this.owner.height - 5,
    };

    this.nextPosition = new Vector(
      this.rng.integer(margins.leftwidth, margins.rightwidth),
      this.rng.integer(margins.topheight, margins.bottomheight)
    );

    if (this.duration > 0) {
      setTimeout(() => {
        if (!(this.owner as Boss)) return;
        this.owner.actions.moveTo(this.nextPosition, (this.owner as Boss).speed);
      }, this.duration);
    } else {
      if (!(this.owner as Boss)) return;
      this.owner.actions.moveTo(this.nextPosition, (this.owner as Boss).speed);
    }
  }

  onRemove(previousOwner: Entity): void {
    super.onRemove(previousOwner);
    (this.handler as Subscription).close();
  }

  cancelMove() {
    this.owner.actions.clearActions();
  }

  reset(modePosition: number = 1, config?: MoveComponentConfig) {
    this.moveToNextRotation();
  }

  onPreUpdate(event: ActorEvents["preupdate"]): void {}
}
