import { v4 as uuid } from 'uuid';
import { EntityDto, EntityType, FieldOfView } from '@game/shared-domain';
import {
  AnyConstructor,
  AnyObject,
  Constructor,
  Coordinates,
  Dimensions,
  EmptyClass,
  mixinBuilder,
  Nullable
} from '@game/shared-utils';
import { GameMapGridItem } from './GameMap';
import { GameWorld } from './GameWorld';
import { LifecycleEvents, withLifeCycle } from '../mixins/withLifecycle';
import { withBehaviors } from '../mixins/withBehaviors';
import { withEmitter } from '../mixins/withEmitter';

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

const mixins = mixinBuilder(EmptyClass)
  .add(withEmitter<Constructor<EmptyClass>, LifecycleEvents>)
  .add(withBehaviors)
  .add(withLifeCycle);
export class Entity extends mixins.build() {
  gridItem: GameMapGridItem;

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
    super();
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

  toDto() {
    console.warn(`.toDto() method not implemented on entity type ${this.type}`);
    return undefined as unknown as EntityDto;
  }
}
