import {
  Coordinates,
  Dimensions,
  EntityDto,
  EntityType,
  uniqBy
} from '@game/shared';
import { gameMap } from '../gameMap';
import { gameWorld } from '../gameWorld';
import { MapGridItem } from './gameMapFactory';

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
  fieldOfView: number;
};

export const createEntity = ({
  id,
  type,
  position,
  dimensions,
  fieldOfView
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
        gameMap.grid
          .findNearbyRadius(entity.position, entity.fieldOfView)
          .map(gridItem => gameWorld.entities.get(gridItem.meta.id) as Entity)
      );

      return uniqBy(entities.flat(), entity => entity.id);
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
