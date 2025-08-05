import { BaseEntity } from "./BaseEntity";

export abstract class RotatableEntity extends BaseEntity {
	public abstract angle: number;
	public angularVelocity: number = 0;
	protected _angle: number = 0;
	protected constructor() {
		super();
	}
}