import EventEmitter from 'events';
import { v4 as uuid } from 'uuid';
import TypedEmitter from 'typed-emitter';
import { EntityDto, EntityType, FieldOfView } from '@game/shared-domain';
import {
  AnyObject,
  Coordinates,
  Dimensions,
  isDefined,
  Nullable,
  uniqBy
} from '@game/shared-utils';
import { MapGridItem } from './GameMap';
import { GameWorld } from './GameWorld';

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

export class Entity {
  protected gridItem: MapGridItem;

  private emitter = new EventEmitter() as EntityEmitter;
  id: string;

  type: EntityType;

  fieldOfView: FieldOfView;

  children: Set<Entity> = new Set();

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

  get visibleEntities(): Entity[] {
    console.log(this.children.size);
    const entities = [this, ...this.children]
      .map(entity =>
        this.world.map.grid
          .findNearbyRadius(entity.position, entity.fieldOfView.hard)
          .map(gridItem => this.world.getEntity(gridItem.meta.id))
      )
      .flat()
      .filter(isDefined);

    return uniqBy(entities, entity => entity.id);
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
