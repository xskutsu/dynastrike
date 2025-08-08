import { Entity } from "../entity/Entity";
import { QuadTree } from "../spatial/QuadTree";

export const MAX_DELTA_TIME: number = 0.25;

// NOT FINAL
// Needs other physical factors as well as major rework.
function collide(instance: Entity, other: Entity): boolean {
	const deltaX = other.positionX - instance.positionX;
	const deltaY = other.positionY - instance.positionY;
	let distanceSquared = deltaX * deltaX + deltaY * deltaY;
	const combinedRadius = instance.radius + other.radius;
	if (distanceSquared < combinedRadius * combinedRadius) {
		const distance = Math.sqrt(distanceSquared);
		const overlap = 0.5 * (combinedRadius - distance) + 0.0001;
		const normalX = distance === 0 ? 1 : deltaX / distance;
		const normalY = distance === 0 ? 0 : deltaY / distance;
		instance.positionX -= overlap * normalX;
		instance.positionY -= overlap * normalY;
		other.positionX += overlap * normalX;
		other.positionY += overlap * normalY;
		const relativeVelocityX = other.velocityX - instance.velocityX;
		const relativeVelocityY = other.velocityY - instance.velocityY;
		const velocityAlongNormal = relativeVelocityX * normalX + relativeVelocityY * normalY;
		if (velocityAlongNormal > 0) {
			return true;
		}
		const restitution = Math.min(instance.restitution, other.restitution);
		const totalInverseMass = 1 / instance.mass + 1 / other.mass;
		let impulseScalar = (-(1 + restitution) * velocityAlongNormal) / totalInverseMass;
		const impulseX = impulseScalar * normalX;
		const impulseY = impulseScalar * normalY;
		instance.velocityX -= (1 / instance.mass) * impulseX;
		instance.velocityY -= (1 / instance.mass) * impulseY;
		other.velocityX += (1 / other.mass) * impulseX;
		other.velocityY += (1 / other.mass) * impulseY;
		return true;
	}
	return false;
}

export class Scene {
	public readonly entities: Entity[] = [];
	public minX: number;
	public minY: number;
	public maxX: number;
	public maxY: number;
	public grid: QuadTree;
	private _activeEntities: Entity[] = [];
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

	public removeEntity(entity: Entity): void {
		const entityIndex: number = entity.index;
		let indexToRemove: number = -1;
		const entities: Entity[] = this.entities;
		const entitiesLength: number = entities.length;
		for (let i: number = 0; i < entitiesLength; i++) {
			if (entities[i].index === entityIndex) {
				indexToRemove = i;
				break;
			}
		}
		if (indexToRemove === -1) {
			return;
		}
		const lastEntity: Entity = entities.pop()!;
		if (lastEntity.index !== entityIndex) {
			entities[indexToRemove] = lastEntity;
		}
		if (!entity.isSleeping) {
			indexToRemove = -1;
			const activeEntities: Entity[] = this._activeEntities;
			const activeEntitiesLength: number = activeEntities.length;
			for (let i: number = 0; i < activeEntitiesLength; i++) {
				if (activeEntities[i].index === entityIndex) {
					indexToRemove = i;
					break;
				}
			}
			if (indexToRemove > -1) {
				const lastActiveEntity: Entity = activeEntities.pop()!;
				if (lastActiveEntity.index !== entityIndex) {
					activeEntities[indexToRemove] = lastActiveEntity;
				}
			}
		}
	}

	public query(minX: number, minY: number, maxX: number, maxY: number): Entity[] {
		return this.grid.query(minX, minY, maxX, maxY);
	}

	public tick(deltaTime: number): void {
		const grid: QuadTree = this.grid;
		const collisions: Set<number> = new Set<number>();
		const newlyAwakened: Entity[] = [];
		const entities: Entity[] = this.entities;
		const entitiesLength: number = entities.length;
		grid.clear();
		for (let i: number = 0; i < entitiesLength; i++) {
			const entity: Entity = entities[i];
			if (!entity.isSleeping) {
				entity.update(deltaTime);
			}
			grid.insertEntity(entity);
		}
		const activeEntities: Entity[] = this._activeEntities;
		const activeEntitiesLength: number = activeEntities.length;
		let write = 0;
		for (let i = 0; i < activeEntitiesLength; i++) {
			const instance: Entity = activeEntities[i];
			if (instance.isSleeping) {
				continue;
			}
			activeEntities[write++] = instance;
			const neighbors: Entity[] = grid.query(instance.minX, instance.minY, instance.maxX, instance.maxY);
			const neighborsLength: number = neighbors.length;
			if (neighborsLength > 1) {
				const instanceIndex: number = instance.index;
				for (let j: number = 0; j < neighborsLength; j++) {
					const other: Entity = neighbors[j];
					const otherIndex: number = other.index;
					if (instanceIndex === otherIndex) {
						continue;
					}
					const pairIndex: number = instanceIndex < otherIndex ? (otherIndex << 16) | instanceIndex : (instanceIndex << 16) | otherIndex;
					if (collisions.has(pairIndex)) {
						continue;
					}
					collisions.add(pairIndex);
					if (collide(instance, other)) {
						const snoozer: boolean = other.isSleeping;
						other.wakeUp();
						if (snoozer) {
							newlyAwakened.push(other);
						}
					}
				}
			}
		}
		activeEntities.length = write;
		const newlyAwakenedLength = newlyAwakened.length;
		for (let i: number = 0; i < newlyAwakenedLength; i++) {
			activeEntities.push(newlyAwakened[i]);
		}
	}
}