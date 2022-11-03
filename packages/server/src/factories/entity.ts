import { EntityDto, EntityType } from '@game/domain';
import { Coordinates, Dimensions, uniqBy } from '@game/shared-utils';
import { v4 as uuid } from 'uuid';
import { MapGridItem } from './gameMap';
import { GameWorld } from './gameWorld';

export type EntityLifecycleCallback = (entity: Entity) => void;
export type EntityLifecycleEvent = 'update' | 'destroy';

export type Entity = {
  id: string;
  type: EntityType;
  gridItem: MapGridItem;
  position: Readonly<Coordinates>;
  dimensions: Readonly<Dimensions>;
  visibleEntities: Readonly<Entity[]>;
  fieldOfView: number;
  children: Set<Entity>;
  world: GameWorld;
  update: () => void;
  destroy: () => void;
  on: (eventName: EntityLifecycleEvent, cb: EntityLifecycleCallback) => Entity;
  dispatch: (eventName: EntityLifecycleEvent) => Entity;
  toDto: () => EntityDto;
};

export type MakeEntityOptions = {
  id?: string;
  type: EntityType;
  position: Coordinates;
  dimensions: Dimensions;
  fieldOfView: number;
  world: GameWorld;
};

export const createEntity = ({
  id = uuid(),
  type,
  position,
  dimensions,
  world,
  fieldOfView
}: MakeEntityOptions): Entity => {
  const callbacks: Record<
    EntityLifecycleEvent,
    Set<EntityLifecycleCallback>
  > = {
    update: new Set(),
    destroy: new Set()
  };

  const gridItem = world.map.grid.add(
    {
      position,
      dimensions
    },
    { id }
  );

  return {
    id,
    type,
    world,
    gridItem,
    fieldOfView,
    children: new Set<Entity>(),

    get position() {
      return gridItem.position;
    },
    get dimensions() {
      return gridItem.dimensions;
    },

    get visibleEntities() {
      const entities = [this, ...this.children].map(entity =>
        world.map.grid
          .findNearbyRadius(entity.position, entity.fieldOfView)
          .map(gridItem => world.entities.get(gridItem.meta.id) as Entity)
      );

      return uniqBy(entities.flat(), entity => entity.id);
    },

    update() {
      this.dispatch('update');
    },

    destroy() {
      world.map.grid.remove(this.gridItem);
      this.dispatch('destroy');
    },

    on(eventName: EntityLifecycleEvent, cb: EntityLifecycleCallback) {
      callbacks[eventName].add(cb);

      return this;
    },

    dispatch(eventName: EntityLifecycleEvent) {
      callbacks[eventName].forEach(cb => cb(this));

      return this;
    },

    toDto() {
      const dto = {
        id,
        type,
        ...this.position
      };

      return dto;
    }
  };
};
