import { collide } from "../collisions/collide";
import { Entity } from "../entity/Entity";
import { QuadTree } from "../spatial/QuadTree";

export const MAX_DELTA_TIME: number = 0.25;

export class Scene {
	public readonly entities: Entity[] = [];
	public minX: number;
	public minY: number;
	public maxX: number;
	public maxY: number;
	public grid: QuadTree;
	private _activeEntities: Entity[] = [];
	private _newlyAwakened: Entity[] = [];
	private _collisionPairs: Set<number> = new Set<number>();
	constructor(minX: number, minY: number, maxX: number, maxY: number, gridDepth: number) {
		this.minX = minX;
		this.minY = minY;
		this.maxX = maxX;
		this.maxY = maxY;
		this.grid = new QuadTree(minX, minY, maxX, maxY, gridDepth);
	}

	public addEntity(entity: Entity): void {
		this.entities.push(entity);
		if (!entity.isSleeping) {
			this._activeEntities.push(entity);
		}
	}

	public query(minX: number, minY: number, maxX: number, maxY: number): Entity[] {
		return this.grid.query(minX, minY, maxX, maxY);
	}

	public tick(deltaTime: number): void {
		this.grid.clear();
		this._collisionPairs.clear();
		this._newlyAwakened = [];
		this._updateEntities(deltaTime);
		this._processCollisions();
		this._promoteAwakenedEntities();
	}

	private _updateEntities(deltaTime: number): void {
		const entities: Entity[] = this.entities;
		const entitiesLength: number = entities.length;
		for (let i: number = 0; i < entitiesLength; i++) {
			const entity: Entity = entities[i];
			if (!entity.isSleeping) {
				entity.update(deltaTime);
			}
			this.grid.insertEntity(entity);
		}
	}

	private _processCollisions(): void {
		const activeEntities: Entity[] = this._activeEntities;
		const activeEntitiesLength: number = activeEntities.length;
		const collisionPairs: Set<number> = this._collisionPairs;
		const newlyAwakened: Entity[] = this._newlyAwakened;
		let writeIndex: number = 0;
		for (let i: number = 0; i < activeEntitiesLength; i++) {
			const instance = activeEntities[i];
			if (!instance.isSleeping) {
				activeEntities[writeIndex++] = instance;
				const neighbors: Entity[] = this.grid.query(instance.minX, instance.minY, instance.maxX, instance.maxY);
				const neighborsLength: number = neighbors.length;
				const instanceIndex: number = instance.index;
				for (let i: number = 0; i < neighborsLength; i++) {
					const other = neighbors[i];
					const otherIndex = other.index;
					if (instanceIndex !== otherIndex) {
						const pairKey: number = instanceIndex < otherIndex ? (otherIndex << 16) | instanceIndex : (instanceIndex << 16) | otherIndex;
						if (!collisionPairs.has(pairKey)) {
							collisionPairs.add(pairKey);
							if (collide(instance, other)) {
								if (other.isSleeping) {
									newlyAwakened.push(other);
								}
								other.wakeUp();
							}
						}
					}
				}
			}
		}
		activeEntities.length = writeIndex;
	}

	private _promoteAwakenedEntities(): void {
		const activeEntities: Entity[] = this._activeEntities;
		const awakenedEntities: Entity[] = this._newlyAwakened;
		const awakenedEntitiesLength: number = awakenedEntities.length;
		for (let i: number = 0; i < awakenedEntitiesLength; i++) {
			activeEntities.push(awakenedEntities[i]);
		}
	}
}