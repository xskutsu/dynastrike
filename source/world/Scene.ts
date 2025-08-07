import { Entity } from "../entity/Entity";
import { QuadTree } from "../spatial/QuadTree";

export const MAX_DELTA_TIME: number = 0.25;

export class Scene {
	public readonly entities: Map<number, Entity> = new Map<number, Entity>();
	public minX: number;
	public minY: number;
	public maxX: number;
	public maxY: number;
	public grid: QuadTree;
	constructor(minX: number, minY: number, maxX: number, maxY: number, gridDepth: number) {
		this.minX = minX;
		this.minY = minY;
		this.maxX = maxX;
		this.maxY = maxY;
		this.grid = new QuadTree(minX, minY, maxX, maxY, gridDepth);
	}

	public addEntity(entity: Entity): boolean {
		const existed: boolean = this.entities.has(entity.index);
		this.entities.set(entity.index, entity);
		return existed;
	}

	public removeEntity(entity: Entity): boolean {
		return this.entities.delete(entity.index);
	}

	public query(minX: number, minY: number, maxX: number, maxY: number): Entity[] {
		return this.grid.query(minX, minY, maxX, maxY);
	}

	public tick(deltaTime: number): void {
		const grid: QuadTree = this.grid;
		grid.clear();
		const collisions: Set<number> = new Set<number>();
		let colliders: Entity[];
		let collidersLength: number;
		let other: Entity;
		let instanceIndex: number;
		let otherIndex: number;
		let pairIndex: number;
		for (const instance of this.entities.values()) {
			if (instance.isSleeping) {
				grid.insertEntity(instance);
			} else {
				instance.update(deltaTime);
				colliders = grid.query(instance.minX, instance.minY, instance.maxX, instance.maxY);
				grid.insertEntity(instance);
				collidersLength = colliders.length;
				if (collidersLength > 0) {
					instanceIndex = instance.index;
					for (let i: number = 0; i < collidersLength; i++) {
						other = colliders[i];
						otherIndex = other.index;
						pairIndex = instanceIndex < otherIndex ? (otherIndex << 16) | instanceIndex : (instanceIndex << 16) | otherIndex;
						if (!collisions.has(pairIndex)) {
							collisions.add(pairIndex);
						}
					}
				}
			}
		}
	}
}