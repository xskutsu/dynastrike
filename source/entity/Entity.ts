export class Entity {
	private static _indexTicker: number = 1;

	public readonly index: number = Entity._indexTicker++;
	public velocityX: number = 0;
	public velocityY: number = 0;
	public positionX: number = 0;
	public positionY: number = 0;
	public mass: number = 1;
	public linearDrag: number = 1;
	public restitution: number = 1;
	public isStatic: boolean = false;
	constructor(positionX: number, positionY: number) {
		this.positionX = positionX;
		this.positionY = positionY;
	}

	public clone(): Entity {
		const entity = new Entity(this.positionX, this.positionY);
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