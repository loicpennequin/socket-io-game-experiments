import { WithEventEmitter } from './eventEmitter';

export type WithLifecycle = {
  update: () => void;
  destroy: () => void;
};

export type LifecycleEvents = {
  updated: () => void;
  destroyed: () => void;
};

export const withLifecycle = <TObj extends WithEventEmitter<LifecycleEvents>>(
  obj: TObj
): TObj & WithLifecycle =>
  Object.assign({}, obj, {
    update: () => {
      obj.dispatch('updated');
    },

    destroy: () => {
      obj.dispatch('destroyed');
    }
  });
