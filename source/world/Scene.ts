import { QuadTree } from "../spatial/QuadTree";
import { Entity } from "../types/entity";

export class Scene {
	public readonly entities: Map<number, Entity> = new Map<number, Entity>();
	public minX: number;
	public minY: number;
	public maxX: number;
	public maxY: number;
	public grid: QuadTree;
	constructor(minX: number, minY: number, maxX: number, maxY: number, gridSize: number) {
		this.minX = minX;
		this.minY = minY;
		this.maxX = maxX;
		this.maxY = maxY;
		this.grid = new QuadTree(minX, minY, maxX, maxY, gridSize);
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

	public update(): void {
		const processedCollisions: Set<number> = new Set<number>();
		this.grid.clear();
		for (const instance of this.entities.values()) {
			instance.update();
			const potentialColliders: Entity[] = this.grid.query(instance.minX, instance.minY, instance.maxX, instance.maxY);
			this.grid.insertEntity(instance);
			if (potentialColliders.length !== 0) {
				const instanceIndex: number = instance.index;
				const potentialCollidersLength = potentialColliders.length;
				for (let i = 0; i < potentialCollidersLength; i++) {
					const other = potentialColliders[i];
					const otherIndex: number = other.index;
					const pairIndex: number = instanceIndex < otherIndex ? (otherIndex << 16) | instanceIndex : (instanceIndex << 16) | otherIndex;
					if (!processedCollisions.has(pairIndex)) {
						processedCollisions.add(pairIndex);
					}
				}
			}
		}
	}
}