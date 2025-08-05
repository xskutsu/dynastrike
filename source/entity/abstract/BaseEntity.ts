import { EntityTypeValue } from "../../types/entity";

let entityIndexTicker: number = 0;
export abstract class BaseEntity {
	public abstract readonly type: EntityTypeValue;
	public readonly index: number = ++entityIndexTicker;
	public abstract positionX: number;
	public abstract positionY: number;
	public minX: number = 0;
	public minY: number = 0;
	public maxX: number = 0;
	public maxY: number = 0;
	public velocityX: number = 0;
	public velocityY: number = 0;
	protected _positionX: number = 0;
	protected _positionY: number = 0;
	protected constructor() { }
	public abstract update(deltaTime: number): void;
}