import { Entity } from "../entity/Entity";

const COLLISION_EPSILON: number = 1e-12;

export function collide(instance: Entity, other: Entity): boolean {
	const instancePositionX: number = instance.positionX;
	const instancePositionY: number = instance.positionY;
	const otherPositionX: number = other.positionX;
	const otherPositionY: number = other.positionY;
	const distanceX: number = otherPositionX - instancePositionX;
	const distanceY: number = otherPositionY - instancePositionY;
	const instanceRadius: number = instance.radius;
	const otherRadius: number = other.radius;
	const combinedRadius: number = instanceRadius + otherRadius;
	const distanceSquared: number = distanceX * distanceX + distanceY * distanceY;
	if (distanceSquared >= combinedRadius * combinedRadius) {
		return false;
	}

	// Normals
	let normalX: number;
	let normalY: number;
	let distance: number = 0;
	if (distanceSquared < COLLISION_EPSILON) {
		normalX = 1;
		normalY = 0;
	} else {
		distance = Math.sqrt(distanceSquared);
		const inverseDistance: number = 1 / distance;
		normalX = distanceX * inverseDistance;
		normalY = distanceY * inverseDistance;
	}

	// Mass
	const instanceInverseMass: number = instance.inverseMass;
	const otherInverseMass: number = other.inverseMass;
	const totalInverseMass: number = instanceInverseMass + otherInverseMass;

	// Positional correction
	const penetration: number = combinedRadius - distance;
	const correctionMagnitude: number = penetration / totalInverseMass;
	const instanceCorrection: number = correctionMagnitude * instanceInverseMass;
	const otherCorrection: number = correctionMagnitude * otherInverseMass;
	instance.positionX = instancePositionX - instanceCorrection * normalX;
	instance.positionY = instancePositionY - instanceCorrection * normalY;
	other.positionX = otherPositionX + otherCorrection * normalX;
	other.positionY = otherPositionY + otherCorrection * normalY;

	// Contact points
	const instanceRadiusContactX: number = normalX * instanceRadius;
	const instanceRadiusContactY: number = normalY * instanceRadius;
	const otherRadiusContactX: number = -normalX * otherRadius;
	const otherRadiusContactY: number = -normalY * otherRadius;

	// Velocities at contact points
	const instanceVelocityX: number = instance.velocityX;
	const instanceVelocityY: number = instance.velocityY;
	const otherVelocityX: number = other.velocityX;
	const otherVelocityY: number = other.velocityY;
	const instanceAngularVelocity: number = instance.angularVelocity;
	const otherAngularVelocity: number = other.angularVelocity;
	const instanceContactVelocityX: number = instanceVelocityX - instanceAngularVelocity * instanceRadiusContactY;
	const instanceContactVelocityY: number = instanceVelocityY + instanceAngularVelocity * instanceRadiusContactX;
	const otherContactVelocityX: number = otherVelocityX - otherAngularVelocity * otherRadiusContactY;
	const otherContactVelocityY: number = otherVelocityY + otherAngularVelocity * otherRadiusContactX;

	// Relative velocity
	const relativeVelocityX: number = otherContactVelocityX - instanceContactVelocityX;
	const relativeVelocityY: number = otherContactVelocityY - instanceContactVelocityY;
	const velocityAlongNormal: number = relativeVelocityX * normalX + relativeVelocityY * normalY;
	if (velocityAlongNormal > 0) {
		return true;
	}

	// Restitution and friction
	const staticFriction: number = Math.sqrt(instance.staticFriction * other.staticFriction);
	const dynamicFriction: number = Math.sqrt(instance.dynamicFriction * other.dynamicFriction);
	const restitution: number = Math.min(instance.restitution, other.restitution);

	// Tangent vector and impulse
	const tangentX: number = -normalY;
	const tangentY: number = normalX;
	const velocityAlongTangent: number = relativeVelocityX * tangentX + relativeVelocityY * tangentY;
	const instanceInverseInertia: number = instance.inverseInertia;
	const otherInverseInertia: number = other.inverseInertia;
	const tangentImpulseDenominator: number = instanceInverseMass + otherInverseMass + instanceInverseInertia * (instanceRadius * instanceRadius) + otherInverseInertia * (otherRadius * otherRadius);
	const tangentImpulseMagnitude: number = (-velocityAlongTangent) / tangentImpulseDenominator;

	// Normal impulse
	const normalImpulseDenominator: number = instanceInverseMass + otherInverseMass;
	const normalImpulseMagnitude: number = (-(1 + restitution) * velocityAlongNormal) / normalImpulseDenominator;

	// Friction
	let frictionMagnitude: number;
	if (Math.abs(tangentImpulseMagnitude) < Math.abs(normalImpulseMagnitude) * staticFriction) {
		frictionMagnitude = tangentImpulseMagnitude;
	} else {
		const sign: number = tangentImpulseMagnitude > 0 ? 1 : (tangentImpulseMagnitude < 0 ? -1 : 1);
		frictionMagnitude = -Math.abs(normalImpulseMagnitude) * dynamicFriction * sign;
	}
	const frictionImpulseX: number = frictionMagnitude * tangentX;
	const frictionImpulseY: number = frictionMagnitude * tangentY;

	// Final impulses
	const normalImpulseX: number = normalImpulseMagnitude * normalX;
	const normalImpulseY: number = normalImpulseMagnitude * normalY;
	const totalImpulseX: number = normalImpulseX + frictionImpulseX;
	const totalImpulseY: number = normalImpulseY + frictionImpulseY;
	instance.velocityX = instanceVelocityX - instanceInverseMass * totalImpulseX;
	instance.velocityY = instanceVelocityY - instanceInverseMass * totalImpulseY;
	other.velocityX = otherVelocityX + otherInverseMass * totalImpulseX;
	other.velocityY = otherVelocityY + otherInverseMass * totalImpulseY;
	instance.angularVelocity = instanceAngularVelocity - instanceInverseInertia * (instanceRadius * frictionMagnitude);
	other.angularVelocity = otherAngularVelocity - otherInverseInertia * (otherRadius * frictionMagnitude);

	return true;
}
