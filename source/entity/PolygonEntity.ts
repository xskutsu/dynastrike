import { EntityType } from "../const/entityType";
import { RotatableEntity } from "./abstract/RotatableEntity";

export class PolygonEntity extends RotatableEntity {
	public readonly type = EntityType.Polygon;
	public readonly vertices: number[];
	constructor(positionX: number, positionY: number, vertices: number[]) {
		super();
		this._positionX = positionX;
		this._positionY = positionY;
		let minX: number = positionX + vertices[0];
		let minY: number = positionY + vertices[1];
		let maxX = minX;
		let maxY = minY;
		const _vertices: number[] = [minX, minY];
		const verticesLength: number = vertices.length;
		for (let i: number = 2; i < verticesLength; i += 2) {
			const pointX: number = positionX + vertices[i];
			const pointY: number = positionY + vertices[i + 1];
			if (pointX < minX) {
				minX = pointX;
			} else if (pointX > maxX) {
				maxX = pointX;
			}
			if (pointY < minY) {
				minY = pointY;
			} else if (pointY > maxY) {
				maxY = pointY;
			}
			_vertices.push(pointX, pointY);
		}
		this.minX = minX;
		this.minY = minY;
		this.maxX = maxX;
		this.maxY = maxY;
		this.vertices = _vertices;
	}

	public get positionX(): number {
		return this._positionX;
	}

	public set positionX(value: number) {
		const delta = value - this._positionX;
		this._positionX = value;
		const vertices: number[] = this.vertices;
		const verticesLength: number = vertices.length;
		for (let i: number = 0; i < verticesLength; i += 2) {
			vertices[i] += delta;
		}
		this.minX += delta;
		this.maxX += delta;
	}

	public get positionY(): number {
		return this._positionY;
	}

	public set positionY(value: number) {
		const delta = value - this._positionY;
		this._positionY = value;
		const vertices: number[] = this.vertices;
		const verticesLength: number = vertices.length;
		for (let i: number = 1; i < verticesLength; i += 2) {
			vertices[i] += delta;
		}
		this.minY += delta;
		this.maxY += delta;
	}

	public get angle(): number {
		return this._angle;
	}

	public set angle(value: number) {
		const delta: number = value - this._angle;
		this._angle = value;
		const positionX: number = this._positionX;
		const positionY: number = this._positionY;
		const cos: number = Math.cos(delta);
		const sin: number = Math.sin(delta);
		const vertices: number[] = this.vertices;
		const verticesLength: number = vertices.length;
		let maxX: number = vertices[0] - positionX;
		let maxY: number = vertices[1] - positionX;
		let minX: number = maxX * cos - maxY * sin + positionX;
		let minY: number = maxX * sin + maxY * cos + positionY;
		maxX = minX;
		maxY = minY;
		vertices[0] = minX;
		vertices[1] = minY;
		for (let i: number = 2; i < verticesLength; i += 2) {
			const relativeX: number = vertices[i] - positionX;
			const relativeY: number = vertices[i + 1] - positionY;
			const pointX: number = relativeX * cos - relativeY * sin + positionX;
			const pointY: number = relativeX * sin + relativeY * cos + positionY;
			vertices[i] = pointX;
			vertices[i + 1] = pointY;
			if (pointX < minX) {
				minX = pointX;
			} else if (pointX > maxX) {
				maxX = pointX;
			}
			if (pointY < minY) {
				minY = pointY;
			} else if (pointY > maxY) {
				maxY = pointY;
			}
		}
		this.minX = minX;
		this.minY = minY;
		this.maxX = maxX;
		this.maxY = maxY;
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