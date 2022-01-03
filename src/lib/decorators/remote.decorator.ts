import { Reflector } from '@vxf/core';
import { RemoteMetadata } from '../../types';
import { REMOTE_KEY } from '../../const';

export const Remote =
  (): MethodDecorator =>
  (target, method: string): void => {
    Reflector.extend<RemoteMetadata>(target, REMOTE_KEY, { method });
  };
