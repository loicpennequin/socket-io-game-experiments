import { v4 as uuid } from 'uuid';
import { EntityDto, EntityType, FieldOfView } from '@game/shared-domain';
import {
  AnyObject,
  Coordinates,
  Dimensions,
  Nullable
} from '@game/shared-utils';
import { GameMapGridItem } from './GameMap';
import { GameWorld } from './GameWorld';
import { withLifeCycle } from '../mixins/withLifecycle';

export type EntityOptions = {
  id?: string;
  type: EntityType;
  position: Coordinates;
  dimensions: Dimensions;
  fieldOfView: FieldOfView;
  world: GameWorld;
  parent: Nullable<Entity>;
  meta?: AnyObject;
};

export class EntityBase {
  gridItem: GameMapGridItem;

  id: string;

  type: EntityType;

  fieldOfView: FieldOfView;

  children: Set<EntityBase> = new Set();

  parent: Nullable<Readonly<Entity>>;

  world: GameWorld;

  meta: AnyObject;

  constructor({
    id = uuid(),
    type,
    position,
    dimensions,
    fieldOfView,
    world,
    parent,
    meta = {}
  }: EntityOptions) {
    this.id = id;
    this.type = type;
    this.fieldOfView = fieldOfView;
    this.world = world;
    this.parent = parent;
    this.meta = meta;

    this.gridItem = world.map.grid.add(
      {
        position,
        dimensions
      },
      { id }
    );
  }

  get position() {
    return this.gridItem.position;
  }

  get dimensions() {
    return this.gridItem.dimensions;
  }

  toDto(): EntityDto {
    return {
      id: this.id,
      type: this.type,
      meta: this.meta,
      parent: this.parent?.id ?? null,
      children: [...this.children.values()].map(child => child.id),
      ...this.position
    };
  }
}

export const Entity = withLifeCycle(EntityBase);
export type Entity = InstanceType<typeof Entity>;
