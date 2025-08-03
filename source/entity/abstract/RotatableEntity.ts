import { BaseEntity } from "./BaseEntity";

export abstract class RotatableEntity extends BaseEntity {
	public angularVelocity: number = 0;
	protected _angle: number = 0;

	public get angle(): number {
		return this._angle;
	}

	public set angle(value: number) {
		this._angle = value;
	}

	public override update(): void {
		super.update();
		if (Math.abs(this.angularVelocity) > 0.001) {
			this.angle += this.angularVelocity;
		}
	}
}