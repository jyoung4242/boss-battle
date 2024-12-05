import { Actor, ActorEvents, Vector, Engine, ActionCompleteEvent, Random, Entity, MoveTo, Fade, Delay } from "excalibur";
import { MoveComponent, MoveComponentConfig } from "./BossComponents";
import { Boss } from "../Actors/Boss";

/*
TODO
- add fade in / out
- instead of moving, change position
- control isColliding on Boss

sequence is:

- wait delay
- after delay, start fading out and disable collision
- move random waypoint
- wait short delay
- after delay, fade in and enable collision


*/

export class TeleportRoom extends MoveComponent {
  rng: Random = new Random();
  opacity: number = 1;
  nextPosition: Vector = Vector.Zero;
  handler: any;
  duration: number = 2500;
  shortduration: number = 1500;
  waypoints: Vector[] = [];
  numwaypoints: number = 10;

  constructor(public owner: Actor, public engine: Engine, config: MoveComponentConfig) {
    super(owner, engine, config);
    if (config.duration) this.duration = config.duration;
    else this.duration = 2500;
    let margins = {
      leftwidth: 25,
      rightwidth: 800 - this.owner.width - 25,
      topheight: 25,
      bottomheight: 600 - this.owner.height - 25,
    };

    for (let i = 0; i < this.numwaypoints; i++) {
      this.waypoints.push(
        new Vector(this.rng.integer(margins.leftwidth, margins.rightwidth), this.rng.integer(margins.topheight, margins.bottomheight))
      );
    }
  }

  moveToNextRotation() {
    if (!(this.owner as Boss)) return;
    //pick random waypoint
    this.nextPosition = this.rng.pickOne(this.waypoints);

    //disable collision and attacking
    (this.owner as Boss).attackComponent.attackEnable = false;
    (this.owner as Boss).disableCollisions();
    this.owner.actions.fade(0, 1000);
  }

  onAdd(): void {
    this.owner.on("preupdate", this.onPreUpdate.bind(this));
    this.handler = this.owner.on("actioncomplete", (event: ActionCompleteEvent) => {
      if (event.action instanceof Fade) {
        if (this.owner.graphics.opacity == 1.0) {
          // faded in
          if (!(this.owner as Boss)) return;
          (this.owner as Boss).attackComponent.attackEnable = true;
          (this.owner as Boss).enableCollisions();
          this.owner.actions.delay(this.duration);
        } else {
          // faded out
          //move to next spot
          this.owner.pos = this.nextPosition.clone();
          setTimeout(() => {
            if (!(this.owner as Boss)) return;
            this.owner.actions.fade(1.0, 1000);
          }, this.shortduration);
        }
      } else if (event.action instanceof Delay) {
        this.moveToNextRotation();
      }
    });

    this.moveToNextRotation();
  }

  onRemove(previousOwner: Entity): void {
    super.onRemove(previousOwner);
    if (this.handler) this.handler.close();
  }

  cancelMove() {
    this.owner.actions.clearActions();
  }

  reset(modePosition: number = 1, config?: MoveComponentConfig) {
    this.moveToNextRotation();
  }

  onPreUpdate(event: ActorEvents["preupdate"]): void {}
}
