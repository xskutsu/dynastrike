import { EntityType } from "../const/entity";
import { RotatableEntity } from "./abstract/RotatableEntity";

export class CircleEntity extends RotatableEntity {
	public readonly type = EntityType.Circle;
	private _radius: number;
	constructor(positionX: number, positionY: number, radius: number) {
		super(positionX, positionY);
		this.minX = positionX - radius;
		this.maxX = positionX + radius;
		this.minY = positionY - radius;
		this.maxY = positionY + radius;
		this._radius = radius;
	}

	public override get positionX(): number {
		return this._positionX;
	}

	public override set positionX(value: number) {
		this._positionX = value;
		const radius: number = this._radius;
		this.minX = value - radius;
		this.maxX = value + radius;
	}

	public override get positionY(): number {
		return this._positionY;
	}

	public override set positionY(value: number) {
		this._positionY = value;
		const radius: number = this._radius;
		this.minY = value - radius;
		this.maxY = value + radius;
	}

	public get radius(): number {
		return this._radius;
	}

	public set radius(value: number) {
		this._radius = value;
		const positionX: number = this.positionX;
		this.minX = positionX - value;
		this.maxX = positionX + value;
		const positionY: number = this.positionY;
		this.minY = positionY - value;
		this.maxY = positionY + value;
	}
}