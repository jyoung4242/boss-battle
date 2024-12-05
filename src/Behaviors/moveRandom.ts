import { ActionCompleteEvent, Actor, Engine, MoveTo, Random, Vector } from "excalibur";
import { BehaviorNode, BehaviorStatus } from "../Components/behaviorTree";
import { Boss } from "../Actors/Boss";

export class MoveRandom extends BehaviorNode {
  isComplete: boolean = false;
  rng: Random = new Random();
  newSpot: Vector;
  constructor(owner: Actor, public state: any) {
    super(owner);
    this.newSpot = new Vector(this.rng.integer(5, 800 - 155), this.rng.integer(5, 600 - 155));
  }

  preCondition: () => boolean = () => {
    if (this.state.lastAction == "idle") {
      console.log("returning true for move");
      return true;
    }
    return false;
  };

  update(engine: Engine, delta: number): BehaviorStatus {
    if (this.status == "busy") return BehaviorStatus.Running;
    console.log("setting up move");

    this.status = "busy";
    this.newSpot = new Vector(this.rng.integer(5, 800 - 155), this.rng.integer(5, 600 - 155));
    this.owner.actions.moveTo(this.newSpot, (this.owner as Boss).speed);
    this.owner.on("actioncomplete", (event: ActionCompleteEvent) => {
      if (event.action instanceof MoveTo) {
        console.log("move completed");
        this.status = "free";
        this.isComplete = true;
        this.state.lastAction = "move";
      }
    });

    return BehaviorStatus.Running;
  }
}
