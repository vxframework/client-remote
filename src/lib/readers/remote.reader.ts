import { IMetadataReader, Logger, Reflector } from '@vxf/core';
import { RemoteMetadata } from '../../types';
import { REMOTE_KEY } from '../../const';
import { RemoteListener } from '../remote-listener';

export class RemoteReader implements IMetadataReader {
  public static log = true;
  private logger = new Logger('Remote');

  private listeners: Record<string, RemoteListener> = {};

  public getListener(name: string): RemoteListener {
    if (!this.listeners[name]) {
      this.listeners[name] = new RemoteListener(name);
    }
    return this.listeners[name];
  }

  public read(target: unknown): void {
    const ctor = target.constructor;
    const controllerName = Reflector.getControllerName(ctor);
    const remotes = Reflector.get<RemoteMetadata[]>(target, REMOTE_KEY);
    if (!remotes) {
      return null;
    }

    const listener = this.getListener(controllerName);

    remotes.forEach(({ method }) => {
      const handler = target[method].bind(target);
      listener.addHandler(method, handler);
    });
  }
}
