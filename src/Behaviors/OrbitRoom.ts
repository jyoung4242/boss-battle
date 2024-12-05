import { Actor, Engine, Vector } from "excalibur";
import { BehaviorNode, BehaviorStatus } from "../Components/behaviorTree";

const upVector = new Vector(400, 50);
const downVector = new Vector(400, 550);
const leftVector = new Vector(100, 300);
const rightVector = new Vector(700, 300);
const topRightControlPoint1 = new Vector(500, 133);
const topRightControlPoint2 = new Vector(600, 216);
const topLeftControlPoint1 = new Vector(400, 133);
const topLeftControlPoint2 = new Vector(200, 216);
const bottomRightControlPoint1 = new Vector(500, 383);
const bottomRightControlPoint2 = new Vector(600, 383);
const bottomLeftControlPoint1 = new Vector(400, 466);
const bottomLeftControlPoint2 = new Vector(200, 466);

export class OrbitRoomBehavior extends BehaviorNode {
  nextPosition: "up" | "down" | "left" | "right" | "" = "right";
  status: "free" | "busy" = "free";
  constructor(owner: Actor, public duration: number, public direction: "CW" | "CCW", public state: any) {
    super(owner);
  }

  preCondition: () => boolean = () => {
    return true;
    if (this.state.lastAction == "burst") return true;
    return false;
  };

  update(engine: Engine, delta: number): BehaviorStatus {
    if (this.status == "busy") return BehaviorStatus.Running;

    this.status = "busy";
    let newDestination = Vector.Zero;

    switch (this.state.position) {
      case "left":
        break;
      case "right":
        console.log("in correct switch");
        if (this.state.stage == 1) {
          let cp1, cp2;
          if (this.direction == "CCW") {
            newDestination = upVector.clone();
            this.nextPosition = "up";
            cp1 = topRightControlPoint2;
            cp2 = topRightControlPoint1;
          } else {
            newDestination = downVector.clone();
            this.nextPosition = "down";
            cp1 = topRightControlPoint2;
            cp2 = topRightControlPoint1;
          }
          console.log(cp1, cp2, newDestination);

          this.owner.actions.curveTo({
            controlPoints: [cp1, cp2, newDestination],
            durationMs: this.duration / 4,
            mode: "dynamic",
            //quality: 8,
          });
        } else {
          if (this.direction == "CCW") {
          } else {
          }
        }
        break;
      case "up":
        break;
      case "down":
        break;
      default:
        break;
    }

    return BehaviorStatus.Success;
  }
}
