import { Entity } from "../entity/Entity";

export function collide(instance: Entity, other: Entity): boolean {
	const distanceX: number = other.positionX - instance.positionX;
	const distanceY: number = other.positionY - instance.positionY;
	const radius: number = instance.radius + other.radius;
	const distanceSquared: number = distanceX * distanceX + distanceY * distanceY;
	if (distanceSquared >= radius * radius) {
		return false;
	}
	let distance: number = Math.sqrt(distanceSquared);
	let normalX: number;
	let normalY: number;
	if (distance === 0) {
		normalX = 1;
		normalY = 0;
	} else {
		normalX = distanceX / distance;
		normalY = distanceY / distance;
	}
	const instanceinverseMass: number = instance.inverseMass;
	const otherInverseMass: number = other.inverseMass;
	const instanceInverseInertia: number = instance.inverseInertia;
	const otherInverseInertia: number = other.inverseInertia;
	const inverseMassSum: number = instanceinverseMass + otherInverseMass;
	const correctioMagnitude: number = (radius - distance + 1e-4) / inverseMassSum;
	instance.positionX -= correctioMagnitude * instanceinverseMass * normalX;
	instance.positionY -= correctioMagnitude * instanceinverseMass * normalY;
	other.positionX += correctioMagnitude * otherInverseMass * normalX;
	other.positionY += correctioMagnitude * otherInverseMass * normalY;

	const instanceRadius: number = instance.radius;
	const relativeInstanceX: number = normalX * instanceRadius;
	const relativeInstanceY: number = normalY * instanceRadius;
	const otherRadius: number = other.radius;
	const relativeOtherX: number = -normalX * otherRadius;
	const relativeOtherY: number = -normalY * otherRadius;
	const relativeVelocityX: number = (other.velocityX - other.angularVelocity * relativeOtherY) - (instance.velocityX - instance.angularVelocity * relativeInstanceY);
	const relativeVelocityY: number = (other.velocityY + other.angularVelocity * relativeOtherX) - (instance.velocityY + instance.angularVelocity * relativeInstanceX);
	const velocityAlongNormal: number = relativeVelocityX * normalX + relativeVelocityY * normalY;
	if (velocityAlongNormal > 0) {
		return true;
	}
	const normalImpulse: number = (-(1 + Math.min(instance.restitution, other.restitution)) * velocityAlongNormal) / (instanceinverseMass + otherInverseMass);
	const impulseNormalX: number = normalImpulse * normalX;
	const impulseNormalY: number = normalImpulse * normalY;
	instance.velocityX -= instanceinverseMass * impulseNormalX;
	instance.velocityY -= instanceinverseMass * impulseNormalY;
	other.velocityX += otherInverseMass * impulseNormalX;
	other.velocityY += otherInverseMass * impulseNormalY;
	const tangentX: number = -normalY;
	const tangentY: number = normalX;
	const tangentImpulse: number = (-(relativeVelocityX * tangentX + relativeVelocityY * tangentY)) / (instanceinverseMass + otherInverseMass + instanceInverseInertia * (instance.radius * instance.radius) + otherInverseInertia * (other.radius * other.radius));
	const staticFriction: number = Math.sqrt(instance.staticFriction * other.staticFriction);
	const dynamicFriction: number = Math.sqrt(instance.dynamicFriction * other.dynamicFriction);
	let frictionImpulseScalar: number;
	if (Math.abs(tangentImpulse) < normalImpulse * staticFriction) {
		frictionImpulseScalar = tangentImpulse;
	} else {
		frictionImpulseScalar = -normalImpulse * dynamicFriction * (Math.sign(tangentImpulse));
	}
	const impulseTangentX: number = frictionImpulseScalar * tangentX;
	const impulseTangentY: number = frictionImpulseScalar * tangentY;
	instance.velocityX -= instanceinverseMass * impulseTangentX;
	instance.velocityY -= instanceinverseMass * impulseTangentY;
	other.velocityX += otherInverseMass * impulseTangentX;
	other.velocityY += otherInverseMass * impulseTangentY;
	if (instanceInverseInertia !== 0) {
		instance.angularVelocity -= instanceInverseInertia * (instanceRadius * frictionImpulseScalar);
	}
	if (otherInverseInertia !== 0) {
		other.angularVelocity += otherInverseInertia * (-otherRadius * frictionImpulseScalar);
	}
	return true;
}
