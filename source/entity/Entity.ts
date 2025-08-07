export const SLEEP_MOTION_THRESHOLD: number = 0.0001;
export const TICKS_TO_SLEEP: number = 37;

let _entityIndexTicker: number = 0;

export class Entity {
	public readonly index: number = ++_entityIndexTicker;
	public positionX: number;
	public positionY: number;
	public radius: number;
	public minX: number;
	public minY: number;
	public maxX: number;
	public maxY: number;
	public velocityX: number = 0;
	public velocityY: number = 0;
	public angle: number = 0;
	public angularVelocity: number = 0;
	public mass: number = 1;
	public staticFriction: number = 0.6;
	public dynamicFriction: number = 0.4;
	public restitution: number = 0.2;
	public linearDrag: number = 0.1;
	public angularDrag: number = 0.1;
	public isSleeping: boolean = false;
	private _motionTicker: number = 0;
	constructor(positionX: number, positionY: number, radius: number) {
		this.positionX = positionX;
		this.positionY = positionY;
		this.radius = radius;
		this.minX = positionX - radius;
		this.minY = positionY - radius;
		this.maxX = positionX + radius;
		this.maxY = positionY + radius;
	}

	public wakeUp(): void {
		this.isSleeping = false;
		this._motionTicker = 0;
	}

	public update(deltaTime: number): void {
		const linearDecay: number = 1 - this.linearDrag * deltaTime;
		const velocityX: number = this.velocityX * linearDecay;
		this.velocityX = velocityX;
		const velocityY: number = this.velocityY * linearDecay;
		this.velocityY = velocityY;
		const angularDecay: number = 1 - this.angularDrag * deltaTime;
		const angularVelocity: number = this.angularVelocity * angularDecay;
		this.angularVelocity = angularVelocity;
		if ((velocityX * velocityX) + (velocityY * velocityY) + (angularVelocity * angularVelocity) < SLEEP_MOTION_THRESHOLD) {
			if (++this._motionTicker >= TICKS_TO_SLEEP) {
				this.isSleeping = true;
				return;
			}
		} else {
			this._motionTicker = 0;
		}
		const positionX: number = this.positionX + velocityX * deltaTime;
		this.positionX = positionX;
		const radius: number = this.radius;
		this.minX = positionX - radius;
		this.maxX = positionX + radius;
		const positionY: number = this.positionY + velocityY * deltaTime;
		this.positionY = positionY;
		this.minY = positionY - radius;
		this.maxY = positionY + radius;
		this.angle += angularVelocity * deltaTime;
	}
}