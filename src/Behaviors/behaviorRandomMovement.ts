import { Actor, Engine, Random } from "excalibur";
import { BehaviorStatus, RootNode } from "../Components/behaviorTree";
import { IdleBehavior } from "./Idle";
import { MoveRandom } from "./moveRandom";

export class BehaviorRandomMovement extends RootNode {
  rng: Random = new Random();
  state = {
    lastAction: "" as "" | "move" | "idle",
  };

  constructor(owner: Actor) {
    super(owner);
    this.addChild(new IdleBehavior(owner, this.rng.integer(500, 3000), this.state));
    this.addChild(new MoveRandom(owner, this.state));
  }
}
