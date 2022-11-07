import EventEmitter from 'events';
import { v4 as uuid } from 'uuid';
import TypedEmitter from 'typed-emitter';
import { EntityDto, EntityType, FieldOfView } from '@game/shared-domain';
import {
  AnyObject,
  Coordinates,
  Dimensions,
  Nullable
} from '@game/shared-utils';
import { GameMapGridItem } from './GameMap';
import { GameWorld } from './GameWorld';

export type TEntity = {
  id: string;
  type: EntityType;
  gridItem: GameMapGridItem;
  fieldOfView: FieldOfView;
  children: Set<TEntity>;
  parent: Nullable<Readonly<TEntity>>;
  world: GameWorld;
  meta: AnyObject;
  position: Coordinates;
  dimensions: Dimensions;
  on(...args: Parameters<EntityEmitter['on']>): void;
  update(): void;
  destroy(): void;
  toDto(): EntityDto;
};

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

export type EntityEvents = {
  update: (entity: Entity) => void;
  destroy: (entity: Entity) => void;
};

export type EntityEmitter = TypedEmitter<EntityEvents>;

export class Entity implements TEntity {
  private emitter = new EventEmitter() as EntityEmitter;

  gridItem: GameMapGridItem;

  id: string;

  type: EntityType;

  fieldOfView: FieldOfView;

  children: Set<Entity> = new Set();

  parent: Nullable<Readonly<TEntity>>;

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

  on(...args: Parameters<EntityEmitter['on']>) {
    return this.emitter.on(...args);
  }

  update() {
    this.emitter.emit('update', this);
  }

  destroy() {
    this.world.map.grid.remove(this.gridItem);
    this.emitter.emit('destroy', this);
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
