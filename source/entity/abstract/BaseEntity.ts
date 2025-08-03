import { EntityTypeValue } from "../../types/entity";


let entityIndexTicker: number = 1;
export abstract class BaseEntity {
	public abstract readonly type: EntityTypeValue;
	public readonly index: number = entityIndexTicker++;
	public velocityX: number = 0;
	public velocityY: number = 0;
	public minX: number = 0;
	public minY: number = 0;
	public maxX: number = 0;
	public maxY: number = 0;
	protected _positionX: number;
	protected _positionY: number;
	constructor(positionX: number, positionY: number) {
		this._positionX = positionX;
		this._positionY = positionY;
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
		this._positionX = value;
		this.minY = value;
		this.maxY = value;
	}

	public update(): void {
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