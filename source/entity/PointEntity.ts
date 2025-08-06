import { EntityType } from "../const/entityType";
import { BaseEntity } from "./abstract/BaseEntity";

export class PointEntity extends BaseEntity {
	public type = EntityType.Point;
	constructor(positionX: number, positionY: number) {
		super();
		this._positionX = positionX;
		this.minX = positionX;
		this.maxX = positionX;
		this._positionY = positionY;
		this.minY = positionY;
		this.maxY = positionY;
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

	public update(deltaTime: number): void {
		const velocityX: number = this.velocityX;
		if (Math.abs(velocityX) > 0.01) {
			this.positionX += velocityX;
		}
		const velocityY: number = this.velocityY;
		if (Math.abs(velocityY) > 0.01) {
			this.positionY += velocityY;
		}
	}
}