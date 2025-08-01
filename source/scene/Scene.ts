import { Collider } from "../collisions/Collder";
import { Entity } from "../entity/Entity";
import { QuadTree } from "../spatial/QuadTree";

export class Scene {
	public entities: Map<number, Entity> = new Map<number, Entity>();
	public minX: number;
	public minY: number;
	public maxX: number;
	public maxY: number;
	public partitioning: QuadTree;
	constructor(minX: number, minY: number, maxX: number, maxY: number, gridSize: number) {
		this.minX = minX;
		this.minY = minY;
		this.maxX = maxX;
		this.maxY = maxY;
		this.partitioning = new QuadTree(minX, minY, maxX, maxY, gridSize);
	}

	public addEntity(entity: Entity): boolean {
		const existed: boolean = this.entities.has(entity.index);
		this.entities.set(entity.index, entity);
		return existed;
	}

	public removeEntity(entity: Entity): boolean {
		return this.entities.delete(entity.index);
	}

	public query(minX: number, minY: number, maxX: number, maxY: number): Set<Entity> {
		return this.partitioning.query(minX, minY, maxX, maxY);
	}

	public update(): void {
		const processedCollisions: Set<number> = new Set<number>();
		this.partitioning.clear();
		for (const instance of this.entities.values()) {
			instance.update();
			const instanceIndex: number = instance.index;
			const potentialColliders: Set<Entity> = this.partitioning.query(instance.minX, instance.minY, instance.maxX, instance.maxY);
			this.partitioning.insertEntity(instance);
			if (potentialColliders.size !== 0) {
				for (const other of potentialColliders.values()) {
					const otherIndex: number = other.index;
					const pairIndex: number = instanceIndex < otherIndex ? (otherIndex << 16) | instanceIndex : (instanceIndex << 16) | otherIndex;
					if (!processedCollisions.has(pairIndex)) {
						processedCollisions.add(pairIndex);
						if (!(instance.isStatic && other.isStatic)) {
							Collider.collide(instance, other);
						}
					}
				}
			}
		}
	}
}