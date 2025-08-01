import { Entity } from "../entity/Entity";

export class QuadTree {
	public readonly level: number;
	public readonly minX: number;
	public readonly minY: number;
	public readonly maxX: number;
	public readonly maxY: number;
	public hasChildren: boolean = false;
	public childTopLeft: QuadTree | null = null;
	public childTopRight: QuadTree | null = null;
	public childBottomLeft: QuadTree | null = null;
	public childBottomRight: QuadTree | null = null;
	public entities: Entity[] = [];
	constructor(minX: number, minY: number, maxX: number, maxY: number, level: number) {
		this.minX = minX;
		this.minY = minY;
		this.maxX = maxX;
		this.maxY = maxY;
		this.level = level;
	}

	public split(): void {
		const width = (this.minX + this.maxX) * 0.5;
		const height = (this.minY + this.maxY) * 0.5;
		const level: number = this.level - 1;
		this.hasChildren = true;
		this.childTopLeft = new QuadTree(this.minX, this.minY, width, height, level);
		this.childTopRight = new QuadTree(width, this.minY, this.maxX, height, level);
		this.childBottomLeft = new QuadTree(this.minX, height, width, this.maxY, level);
		this.childBottomRight = new QuadTree(width, height, this.maxX, this.maxY, level);
		const entities: Entity[] = this.entities;
		for (let i: number = entities.length - 1; i >= 0; i--) {
			this.insert(entities[i]);
		}
	}

	public insert(entity: Entity): void {
		if (this.hasChildren) {
			const minX: number = entity.minX;
			const minY: number = entity.minY;
			const maxX: number = entity.maxX;
			const maxY: number = entity.maxY;
			const topLeftQuadTree: QuadTree = this.childTopLeft!;
			const topRightQuadTree: QuadTree = this.childTopRight!;
			const bottomLeftQuadTree: QuadTree = this.childBottomLeft!;
			const bottomRightQuadTree: QuadTree = this.childBottomRight!;
			if (maxX > topLeftQuadTree.minX && minX < topLeftQuadTree.maxX && maxY > topLeftQuadTree.minY && minY < topLeftQuadTree.maxY) {
				topLeftQuadTree.insert(entity);
			}
			if (maxX > topRightQuadTree.minX && minX < topRightQuadTree.maxX && maxY > topRightQuadTree.minY && minY < topRightQuadTree.maxY) {
				topRightQuadTree.insert(entity);
			}
			if (maxX > bottomLeftQuadTree.minX && minX < bottomLeftQuadTree.maxX && maxY > bottomLeftQuadTree.minY && minY < bottomLeftQuadTree.maxY) {
				bottomLeftQuadTree.insert(entity);
			}
			if (maxX > bottomRightQuadTree.minX && minX < bottomRightQuadTree.maxX && maxY > bottomRightQuadTree.minY && minY < bottomRightQuadTree.maxY) {
				bottomRightQuadTree.insert(entity);
			}
		} else {
			this.entities.push(entity);
			if (this.level > 0 && this.entities.length > 8) {
				this.split();
			}
		}
	}

	public query(minX: number, minY: number, maxX: number, maxY: number, _rset: Set<Entity> = new Set<Entity>()): Set<Entity> {
		if (maxX > this.minX && minX < this.maxX && maxY > this.minY && minY < this.maxY) {
			if (this.hasChildren) {
				this.childTopLeft!.query(minX, minY, maxX, maxY, _rset);
				this.childTopRight!.query(minX, minY, maxX, maxY, _rset);
				this.childBottomLeft!.query(minX, minY, maxX, maxY, _rset);
				this.childBottomRight!.query(minX, minY, maxX, maxY, _rset);
			} else {
				const entities: Entity[] = this.entities;
				const entitiesLength: number = entities.length;
				if (entitiesLength !== 0) {
					for (let i: number = 0; i < entitiesLength; i++) {
						const entity = entities[i];
						if (entity.minX < maxX && entity.maxX > minX && entity.minY < maxY && entity.maxY > minY) {
							_rset.add(entity);
						}
					}
				}

			}
		}
		return _rset;
	}

	public clear(): void {
		this.hasChildren = false;
		this.childTopLeft = null;
		this.childTopRight = null;
		this.childBottomLeft = null;
		this.childBottomRight = null;
		this.entities = [];
	}
}