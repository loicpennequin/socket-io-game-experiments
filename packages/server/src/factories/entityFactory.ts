import { Coordinates, Dimensions, EntityDto, EntityType } from '@game/shared';
import { gameMap } from '../gameMap';
import { MapGridItem } from './gameMapFactory';

export type EntityLifecycleCallback = (entity: Entity) => void;
export type EntityLifecycleEvent = 'update' | 'destroy';

export type Entity = {
  id: string;
  type: EntityType;
  gridItem: MapGridItem;
  position: Readonly<Coordinates>;
  dimensions: Readonly<Dimensions>;
  update: () => void;
  destroy: () => void;
  on: (eventName: EntityLifecycleEvent, cb: EntityLifecycleCallback) => Entity;
  dispatch: (eventName: EntityLifecycleEvent) => Entity;
  toDto: () => EntityDto;
};

export type MakeEntityOptions = {
  id: string;
  type: EntityType;
  position: Coordinates;
  dimensions: Dimensions;
};

export const createEntity = ({
  id,
  type,
  position,
  dimensions
}: MakeEntityOptions): Entity => {
  const callbacks: Record<
    EntityLifecycleEvent,
    Set<EntityLifecycleCallback>
  > = {
    update: new Set(),
    destroy: new Set()
  };

  const gridItem = gameMap.grid.add(
    {
      position,
      dimensions
    },
    { id }
  );

  return {
    id,
    type,
    gridItem,

    get position() {
      return gridItem.position;
    },
    get dimensions() {
      return gridItem.dimensions;
    },

    update() {
      this.dispatch('update');
    },

    destroy() {
      gameMap.grid.remove(this.gridItem);
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
