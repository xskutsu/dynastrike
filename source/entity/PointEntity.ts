import { EntityType } from "../const/entity";
import { BaseEntity } from "./abstract/BaseEntity";

export class PointEntity extends BaseEntity {
	public readonly type = EntityType.Point;
	constructor(positionX: number, positionY: number) {
		super(positionX, positionY);
		this.minX = positionX;
		this.minY = positionY;
		this.maxX = positionX;
		this.maxY = positionY;
	}
}