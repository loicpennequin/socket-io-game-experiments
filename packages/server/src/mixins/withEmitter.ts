import EventEmitter from 'events';
import TypedEmitter, { EventMap } from 'typed-emitter';
import { AnyConstructor } from '@game/shared-utils';

export const withEmitter = <
  TBase extends AnyConstructor,
  TEvents extends EventMap
>(
  Base: TBase
) => {
  return class Emittable extends Base {
    protected emitter = new EventEmitter() as TypedEmitter<TEvents>;

    on<E extends keyof TEvents>(event: E, listener: TEvents[E]): void {
      this.emitter.on(event, listener);
    }

    off<E extends keyof TEvents>(event: E, listener: TEvents[E]): void {
      this.emitter.off(event, listener);
    }
  };
};

export type Emittable = ReturnType<typeof withEmitter>;
