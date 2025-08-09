import { Entity } from "../entity/Entity";

export const QUADTREE_LEAF_MAX_ENTITIES: number = 8;

export class QuadTree {
	public hasChildren: boolean = false;
	public childTL: QuadTree | undefined;
	public childTR: QuadTree | undefined;
	public childBL: QuadTree | undefined;
	public childBR: QuadTree | undefined;
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
		const minX: number = entity.minX;
		const minY: number = entity.minY;
		const maxX: number = entity.maxX;
		const maxY: number = entity.maxY;
		const stack: QuadTree[] = [this];
		while (stack.length) {
			const node: QuadTree = stack.pop()!;
			if (node.hasChildren) {
				const middleX: number = node.midX;
				const middleY: number = node.midY;
				const isLeft = minX < middleX;
				const isRight = maxX > middleX;
				if (minY < middleY) {
					if (isLeft) {
						stack.push(node.childTL!);
					}
					if (isRight) {
						stack.push(node.childTR!);
					}
				}
				if (maxY > middleY) {
					if (isLeft) {
						stack.push(node.childBL!);
					}
					if (isRight) {
						stack.push(node.childBR!);
					}
				}
			} else {
				const entities: Entity[] = node.entities;
				entities.push(entity);
				if (node.level > 0 && entities.length > QUADTREE_LEAF_MAX_ENTITIES) {
					this.split(node);
				}
			}
		}
	}

	public split(node: QuadTree): void {
		const nextLevel: number = node.level - 1;
		const middleX: number = node.midX;
		const middleY: number = node.midY;
		let minX: number = node.minX;
		let minY: number = node.minY;
		let maxX: number = node.maxX;
		let maxY: number = node.maxY;
		const childTL: QuadTree = new QuadTree(minX, minY, middleX, middleY, nextLevel);
		const childTR: QuadTree = new QuadTree(middleX, minY, maxX, middleY, nextLevel);
		const childBL: QuadTree = new QuadTree(minX, middleY, middleX, maxY, nextLevel);
		const childBR: QuadTree = new QuadTree(middleX, middleY, maxX, maxY, nextLevel);
		node.childTL = childTL;
		node.childTR = childTR;
		node.childBL = childBL;
		node.childBR = childBR;
		node.hasChildren = true;
		const entities: Entity[] = node.entities;
		const entitiesLength: number = entities.length;
		for (let i: number = 0; i < entitiesLength; i++) {
			const entity: Entity = entities[i];
			minX = entity.minX;
			minY = entity.minY;
			maxX = entity.maxX;
			maxY = entity.maxY;
			const isLeft: boolean = minX < middleX;
			const isRight: boolean = maxX > middleX;
			if (minY < middleY) {
				if (isLeft) {
					childTL.entities.push(entity);
				}
				if (isRight) {
					childTR.entities.push(entity);
				}
			}
			if (maxY > middleY) {
				if (isLeft) {
					childBL.entities.push(entity);
				}
				if (isRight) {
					childBR.entities.push(entity);
				}
			}
		}
		entities.length = 0;
		const toSplit: QuadTree[] = [];
		if (childTL.level > 0 && childTL.entities.length > QUADTREE_LEAF_MAX_ENTITIES) {
			toSplit.push(childTL);
		}
		if (childTR.level > 0 && childTR.entities.length > QUADTREE_LEAF_MAX_ENTITIES) {
			toSplit.push(childTR);
		}
		if (childBL.level > 0 && childBL.entities.length > QUADTREE_LEAF_MAX_ENTITIES) {
			toSplit.push(childBL);
		}
		if (childBR.level > 0 && childBR.entities.length > QUADTREE_LEAF_MAX_ENTITIES) {
			toSplit.push(childBR);
		}
		while (toSplit.length) {
			const quadTree = toSplit.pop()!;
			const cNextLevel = quadTree.level - 1;
			const cMidX = quadTree.midX;
			const cMidY = quadTree.midY;
			const cMinX = quadTree.minX;
			const cMinY = quadTree.minY;
			const cMaxX = quadTree.maxX;
			const cMaxY = quadTree.maxY;

			const cTL = new QuadTree(cMinX, cMinY, cMidX, cMidY, cNextLevel);
			const cTR = new QuadTree(cMidX, cMinY, cMaxX, cMidY, cNextLevel);
			const cBL = new QuadTree(cMinX, cMidY, cMidX, cMaxY, cNextLevel);
			const cBR = new QuadTree(cMidX, cMidY, cMaxX, cMaxY, cNextLevel);

			quadTree.childTL = cTL;
			quadTree.childTR = cTR;
			quadTree.childBL = cBL;
			quadTree.childBR = cBR;
			quadTree.hasChildren = true;

			const ce = quadTree.entities;
			const clen = ce.length;
			for (let j = 0; j < clen; j++) {
				const e = ce[j];
				const eMinX = e.minX;
				const eMinY = e.minY;
				const eMaxX = e.maxX;
				const eMaxY = e.maxY;

				const isLeft = eMinX < cMidX;
				const isRight = eMaxX > cMidX;

				if (eMinY < cMidY) {
					if (isLeft) cTL.entities.push(e);
					if (isRight) cTR.entities.push(e);
				}
				if (eMaxY > cMidY) {
					if (isLeft) cBL.entities.push(e);
					if (isRight) cBR.entities.push(e);
				}
			}
			ce.length = 0;

			// schedule further splits if needed
			if (cTL.level > 0 && cTL.entities.length > QUADTREE_LEAF_MAX_ENTITIES) toSplit.push(cTL);
			if (cTR.level > 0 && cTR.entities.length > QUADTREE_LEAF_MAX_ENTITIES) toSplit.push(cTR);
			if (cBL.level > 0 && cBL.entities.length > QUADTREE_LEAF_MAX_ENTITIES) toSplit.push(cBL);
			if (cBR.level > 0 && cBR.entities.length > QUADTREE_LEAF_MAX_ENTITIES) toSplit.push(cBR);
		}
	}

	/**
	 * Iterative query by rectangle: explicit stack instead of recursion.
	 * Returns the accumulator array `_rset` (same behavior as original).
	 */
	public query(minX: number, minY: number, maxX: number, maxY: number, _rset: Entity[] = []): Entity[] {
		const stack: QuadTree[] = [this];

		while (stack.length) {
			const node = stack.pop()!;

			if (node.hasChildren) {
				const midX = node.midX;
				const midY = node.midY;

				const isLeft = minX < midX;
				const isRight = maxX > midX;

				if (minY < midY) {
					if (isLeft) stack.push(node.childTL!);
					if (isRight) stack.push(node.childTR!);
				}
				if (maxY > midY) {
					if (isLeft) stack.push(node.childBL!);
					if (isRight) stack.push(node.childBR!);
				}
				continue;
			}

			// Leaf: test entities
			const ents = node.entities;
			for (let i = 0, len = ents.length; i < len; i++) {
				const e = ents[i];
				if (e.minX < maxX && e.maxX > minX && e.minY < maxY && e.maxY > minY) {
					_rset.push(e);
				}
			}
		}

		return _rset;
	}

	/**
	 * Iterative query by point.
	 */
	public queryPoint(pointX: number, pointY: number, _rset: Entity[] = []): Entity[] {
		const stack: QuadTree[] = [this];

		while (stack.length) {
			const node = stack.pop()!;

			if (node.hasChildren) {
				const midX = node.midX;
				const midY = node.midY;

				if (pointY < midY) {
					if (pointX < midX) stack.push(node.childTL!);
					else stack.push(node.childTR!);
				} else {
					if (pointX < midX) stack.push(node.childBL!);
					else stack.push(node.childBR!);
				}
				continue;
			}

			const ents = node.entities;
			for (let i = 0, len = ents.length; i < len; i++) {
				const e = ents[i];
				if (e.minX <= pointX && e.maxX >= pointX && e.minY <= pointY && e.maxY >= pointY) {
					_rset.push(e);
				}
			}
		}

		return _rset;
	}

	public clear(): void {
		this.hasChildren = false;
		this.childTL = undefined;
		this.childTR = undefined;
		this.childBL = undefined;
		this.childBR = undefined;
		this.entities.length = 0;
	}
}
