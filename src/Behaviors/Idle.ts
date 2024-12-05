import { Actor, Engine } from "excalibur";
import { BehaviorNode, BehaviorStatus } from "../Components/behaviorTree";

export class IdleBehavior extends BehaviorNode {
  tik: number = 0;
  constructor(owner: Actor, public duration: number, public state: any) {
    super(owner);
  }

  preCondition: () => boolean = () => {
    if (this.state.lastAction == "" || this.state.lastAction == "move") {
      console.log("returning true for idle");
      return true;
    }
    return false;
  };

  update(engine: Engine, delta: number): BehaviorStatus {
    this.tik += delta;

    if (this.tik >= this.duration) {
      console.log("finished waiting");
      this.tik = 0;
      this.state.lastAction = "idle";
      this.status = "free";
      return BehaviorStatus.Success;
    }

    this.status == "busy";
    return BehaviorStatus.Running;
  }
}
