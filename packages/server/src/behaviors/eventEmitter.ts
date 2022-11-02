import { AnyObject } from '@game/shared-utils';
import { EventEmitter } from 'events';

export type EventsMap = {
  [event: string]: any;
};

export type EventNames<Map extends EventsMap> = keyof Map;

export type EventParams<
  Map extends EventsMap,
  Ev extends EventNames<Map>
> = Parameters<Map[Ev]>;

export type WithEventEmitter<TEvents extends EventsMap> = {
  on: <K extends EventNames<TEvents>>(eventName: K, cb: TEvents[K]) => void;
  off: <K extends EventNames<TEvents>>(eventName: K, cb: TEvents[K]) => void;
  dispatch<K extends EventNames<TEvents>>(
    ev: K,
    ...args: EventParams<TEvents, K>
  ): void;
};

export const withEventEmitter = <
  TEvents extends { [k: string]: (...args: any[]) => void },
  TObj extends AnyObject
>(
  obj: TObj
): TObj & WithEventEmitter<TEvents> => {
  const emitter = new EventEmitter();

  const mixin: WithEventEmitter<TEvents> = {
    on(eventName, cb) {
      emitter.on(eventName as string, cb);
    },

    off(eventName, cb) {
      emitter.off(eventName as string, cb);
    },

    dispatch(eventName, ...args) {
      emitter.emit(eventName as string, ...args);
    }
  };

  return Object.assign({}, obj, mixin);
};
