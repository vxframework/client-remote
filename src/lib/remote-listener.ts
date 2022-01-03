import { func, Logger, ILogger } from '@vxf/core';

export class RemoteListener {
  private logger: ILogger;

  constructor(private name: string) {
    global.onNet?.(`vxf.rpc.call.${name}`, this.call.bind(this));
    global.onNet?.(`vxf.rpc.request.${name}`, this.request.bind(this));
    this.logger = new Logger(`RemoteListener:${name}`);
  }

  private handlers: Record<string, func> = {};

  private respond(id: string, value: unknown): void {
    global.emitNet('vxf.rpc.response', id, value);
  }

  private call(method: string, ...args: unknown[]): unknown {
    return this.handlers[method]?.(...args);
  }

  private request(method: string, id: string, ...args: unknown[]): unknown {
    const handler = this.handlers[method];
    if (!handler) {
      return null;
    }
    const result = (async (): Promise<unknown> => handler(...args))();
    return result
      .then(r => this.respond(id, r))
      .catch(e => {
        this.logger.error(
          `An error has occurred on RPC request with method ${id}`,
          e.message,
        );
        this.respond(id, null);
      });
  }

  public addHandler(method: string, handler: func): void {
    if (this.handlers[method]) {
      throw new Error(
        `Cannot apply @Remote() decorator to ${method} multiple times`,
      );
    }
    this.handlers[method] = handler;
  }
}
