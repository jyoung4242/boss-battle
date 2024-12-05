import { Actor, Engine } from "excalibur";
import { BehaviorNode, BehaviorStatus } from "../Components/behaviorTree";

export class BurstFireBehavior extends BehaviorNode {
  constructor(owner: Actor, public duration: number, public state: any) {
    super(owner);
  }

  preCondition: () => boolean = () => {
    return false;
  };

  update(engine: Engine, delta: number): BehaviorStatus {
    return BehaviorStatus.Success;
  }
}
