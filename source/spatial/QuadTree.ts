import { Entity } from "../types/entity";

export class QuadTree {
	public hasChildren: boolean = false;
	public childTL: QuadTree | null = null;
	public childTR: QuadTree | null = null;
	public childBL: QuadTree | null = null;
	public childBR: QuadTree | null = null;
	public readonly entities: Entity[] = [];
	public readonly minX: number;
	public readonly minY: number;
	public readonly maxX: number;
	public readonly maxY: number;
	public readonly midX: number;
	public readonly midY: number;
	public readonly level: number;
	constructor(minX: number, minY: number, maxX: number, maxY: number, level: number) {
		this.minX = minX;
		this.minY = minY;
		this.maxX = maxX;
		this.maxY = maxY;
		this.midX = (minX + maxX) * 0.5;
		this.midY = (minY + maxY) * 0.5;
		this.level = level;
	}

	public insertEntity(entity: Entity): void {
		if (this.hasChildren) {
			const minX: number = entity.minX;
			const minY: number = entity.minY;
			const maxX: number = entity.maxX;
			const maxY: number = entity.maxY;
			if (minY < this.midY) {
				if (minX < this.midX) {
					this.childTL!.insertEntity(entity);
				}
				if (maxX > this.midX) {
					this.childTR!.insertEntity(entity);
				}
			}
			if (maxY > this.midY) {
				if (minX < this.midX) {
					this.childBL!.insertEntity(entity);
				}
				if (maxX > this.midX) {
					this.childBR!.insertEntity(entity);
				}
			}
		} else {
			const entities: Entity[] = this.entities;
			entities.push(entity);
			if (this.level > 0 && entities.length > 8) {
				this.split();
			}
		}
	}

	// TODO: Create a pool of result sets or return to parameter-based approach.
	public queryResult: Set<Entity> = new Set<Entity>();
	public query(minX: number, minY: number, maxX: number, maxY: number): void {
		if (this.hasChildren) {
			if (minY < this.midY) {
				if (minX < this.midX) {
					this.childTL!.query(minX, minY, maxX, maxY);
				}
				if (maxX > this.midX) {
					this.childTR!.query(minX, minY, maxX, maxY);
				}
			}
			if (maxY > this.midY) {
				if (minX < this.midX) {
					this.childBL!.query(minX, minY, maxX, maxY);
				}
				if (maxX > this.midX) {
					this.childBR!.query(minX, minY, maxX, maxY);
				}
			}
		} else {
			const entities: Entity[] = this.entities;
			const entitiesLength: number = entities.length;
			if (entitiesLength > 0) {
				const result: Set<Entity> = this.queryResult;
				for (let i: number = 0; i < entitiesLength; i++) {
					const entity = entities[i];
					if (entity.minX < maxX && entity.maxX > minX && entity.minY < maxY && entity.maxY > minY) {
						result.add(entity);
					}
				}
			}
		}
	}

	private split(): void {
		this.hasChildren = true;
		const nextLevel: number = this.level - 1;
		const childTL: QuadTree = new QuadTree(this.minX, this.minY, this.midX, this.midY, nextLevel);
		const childTR: QuadTree = new QuadTree(this.midX, this.minY, this.maxX, this.midY, nextLevel);
		const childBL: QuadTree = new QuadTree(this.minX, this.midY, this.midX, this.maxY, nextLevel);
		const childBR: QuadTree = new QuadTree(this.midX, this.midY, this.maxX, this.maxY, nextLevel);
		const entities: Entity[] = this.entities;
		const entitiesLength: number = entities.length;
		for (let i = 0; i < entitiesLength; i++) {
			const entity: Entity = entities[i];
			const minX: number = entity.minX;
			const minY: number = entity.minY;
			const maxX: number = entity.maxX;
			const maxY: number = entity.maxY;
			if (minY < this.midY) {
				if (minX < this.midX) {
					childTL.insertEntity(entity);
				}
				if (maxX > this.midX) {
					childTR.insertEntity(entity);
				}
			}
			if (maxY > this.midY) {
				if (minX < this.midX) {
					childBL.insertEntity(entity);
				}
				if (maxX > this.midX) {
					childBR.insertEntity(entity);
				}
			}
		}
		this.childTL = childTL;
		this.childTR = childTR;
		this.childBL = childBL;
		this.childBR = childBR;
		entities.length = 0;
	}

	public clear(): void {
		this.hasChildren = false;
		this.childTL = null;
		this.childTR = null;
		this.childBL = null;
		this.childBR = null;
		this.entities.length = 0;
	}
}