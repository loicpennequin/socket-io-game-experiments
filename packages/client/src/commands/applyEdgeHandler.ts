import { pointRectCollision, type Coordinates } from '@game/shared-utils';

export type ApplyEdgeHandlerOptions = {
  canvas: HTMLCanvasElement;
  edgeSize: number;
  mousePosition: Coordinates;
  cb: (edges: EdgesResult) => void;
};

export type EdgesResult = {
  right: boolean;
  left: boolean;
  top: boolean;
  bottom: boolean;
};
export const applyEdgeHandler = ({
  canvas,
  edgeSize,
  mousePosition,
  cb
}: ApplyEdgeHandlerOptions) => {
  const edgesResult = {
    top: pointRectCollision(mousePosition, {
      x: 0,
      y: 0,
      w: canvas.width,
      h: edgeSize
    }),
    bottom: pointRectCollision(mousePosition, {
      x: 0,
      y: canvas.height - edgeSize,
      w: canvas.width,
      h: canvas.height
    }),
    left: pointRectCollision(mousePosition, {
      x: 0,
      y: 0,
      w: edgeSize,
      h: canvas.height
    }),
    right: pointRectCollision(mousePosition, {
      x: canvas.width - edgeSize,
      y: 0,
      w: canvas.width,
      h: canvas.height
    })
  };

  cb(edgesResult);
};
