export class Entity {
	private static _indexTicker: number = 1;

	public readonly index: number = Entity._indexTicker++;
	public velocityX: number = 0;
	public velocityY: number = 0;
	public minX: number;
	public minY: number;
	public maxX: number;
	public maxY: number;
	public mass: number = 1;
	public linearDrag: number = 1;
	public restitution: number = 1;
	public isStatic: boolean = false;
	protected _positionX: number;
	protected _positionY: number;
	constructor(positionX: number, positionY: number) {
		this._positionX = positionX;
		this._positionY = positionY;
		this.minX = positionX;
		this.minY = positionY;
		this.maxX = positionX;
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

	public update(): void {
		this.positionX += this.velocityX *= this.linearDrag;
		this.positionY += this.velocityY *= this.linearDrag;
	}
}