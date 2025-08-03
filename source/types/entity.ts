import { EntityType } from "../const/entity";
import { CircleEntity } from "../entity/CircleEntity";
import { PointEntity } from "../entity/PointEntity";
import { PolygonEntity } from "../entity/PolygonEntity";

export type EntityTypeValue = typeof EntityType[keyof typeof EntityType];

export type Entity = PointEntity | CircleEntity | PolygonEntity;