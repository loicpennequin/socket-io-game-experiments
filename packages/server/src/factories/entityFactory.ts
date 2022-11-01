import { Coordinates, Dimensions, EntityDto, EntityType } from '@game/shared';
import { mapController, MapGridItem } from '../controllers/mapController';

export type Entity = {
  id: string;
  type: EntityType;
  gridItem: MapGridItem;
  position: Readonly<Coordinates>;
  dimensions: Readonly<Dimensions>;
  update: () => void;
  toDto: () => EntityDto;
};

export type MakeEntityOptions = {
  id: string;
  type: EntityType;
  position: Coordinates;
  dimensions: Dimensions;
};

export const makeEntity = ({
  id,
  type,
  position,
  dimensions
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
      console.log(`Update function not implemented for eneity of type ${type}`);
    },

    toDto() {
      return {
        id,
        type,
        ...gridItem.position
      };
    }
  };
};
