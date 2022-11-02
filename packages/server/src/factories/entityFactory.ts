import {
  Coordinates,
  Dimensions,
  EntityDto,
  EntityType,
  noop
} from '@game/shared';
import { mapController, MapGridItem } from '../controllers/mapController';

export type Entity = {
  id: string;
  type: EntityType;
  gridItem: MapGridItem;
  position: Readonly<Coordinates>;
  dimensions: Readonly<Dimensions>;
  update: () => void;
  destroy: () => void;
  toDto: () => EntityDto;
};

export type MakeEntityOptions = {
  id: string;
  type: EntityType;
  position: Coordinates;
  dimensions: Dimensions;
  onUpdated?: (entity: Entity) => void;
  onDestroyed?: (entity: Entity) => void;
};

export const createEntity = ({
  id,
  type,
  position,
  dimensions,
  onUpdated = noop,
  onDestroyed = noop
}: MakeEntityOptions): Entity => {
  const gridItem = mapController.grid.add(
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
      return onUpdated(this);
    },

    destroy() {
      return onDestroyed(this);
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
