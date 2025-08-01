export class Entity {
	private static _indexTicker: number = 1;

	public readonly index: number = Entity._indexTicker++;
	public velocityX: number = 0;
	public velocityY: number = 0;
	public minX: number = 0;
	public minY: number = 0;
	public maxX: number = 0;
	public maxY: number = 0;
	public mass: number = 1;
	public linearDrag: number = 1;
	public restitution: number = 1;
	public isStatic: boolean = false;
	private _positionX: number = 0;
	private _positionY: number = 0;
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

	public clone(): Entity {
		const entity = new Entity(this._positionX, this._positionY);
		entity.velocityX = this.velocityX;
		entity.velocityY = this.velocityY;
		entity.mass = this.mass;
		entity.linearDrag = this.linearDrag;
		entity.restitution = this.restitution;
		entity.isStatic = this.isStatic;
		return entity;
	}

	public update(): void {
		this.velocityX *= this.linearDrag;
		this.velocityY *= this.linearDrag;
		this.positionX += this.velocityX;
		this.positionY += this.velocityY;
	}
}