import { EntityType } from "../const/entity";
import { RotatableEntity } from "./abstract/RotatableEntity";

export class CircleEntity extends RotatableEntity {
	public type = EntityType.Circle;
	public angle: number = 0;
	protected _radius: number = 0;
	constructor(positionX: number, positionY: number, radius: number) {
		super();
		this._positionX = positionX;
		this.minX = positionX - radius;
		this.maxX = positionX + radius;
		this._positionY = positionY;
		this.minY = positionY - radius;
		this.maxY = positionY + radius;
		this._radius = radius;
	}

	public get positionX(): number {
		return this._positionX;
	}

	public set positionX(value: number) {
		this._positionX = value;
		this.minX = value;
		this.maxX = value;
	}

	public get positionY(): number {
		return this._positionY;
	}

	public set positionY(value: number) {
		this._positionY = value;
		this.minY = value;
		this.maxY = value;
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

	public update(deltaTime: number): void {
		const velocityX: number = this.velocityX;
		if (Math.abs(velocityX) > 0.01) {
			this.positionX += velocityX;
		}
		const velocityY: number = this.velocityY;
		if (Math.abs(velocityY) > 0.01) {
			this.positionY += velocityY;
		}
		const angularVelocity: number = this.angularVelocity;
		if (Math.abs(angularVelocity) > 0.001) {
			this.angle += angularVelocity;
		}
	}
}