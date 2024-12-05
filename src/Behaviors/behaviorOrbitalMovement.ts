import { Actor, Engine, Random } from "excalibur";
import { BehaviorStatus, RootNode } from "../Components/behaviorTree";
import { IdleBehavior } from "./Idle";
import { MoveRandom } from "./moveRandom";
import { OrbitRoomBehavior } from "./OrbitRoom";
import { BurstFireBehavior } from "./BurstFire";

export class BehaviorOrbitMovement extends RootNode {
  rng: Random = new Random();
  state = {
    lastAction: "" as "" | "burst" | "idle" | "rotate",
    position: "right" as "" | "left" | "right" | "up" | "down",
    stage: 1 as 1 | 2,
  };

  constructor(owner: Actor) {
    super(owner);
    //this.rng.pickOne(["CW", "CCW"])
    this.addChild(new OrbitRoomBehavior(owner, this.rng.integer(10000, 12000), "CCW", this.state));
    //this.addChild(new IdleBehavior(owner, this.rng.integer(500, 3000), this.state));
    //this.addChild(new BurstFireBehavior(owner, this.rng.integer(5000, 10000), this.state));
  }
}
