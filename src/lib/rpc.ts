import { Random } from '@vxf/core';

export class RPC {
  constructor(name: string) {
    this.name = name;
  }

  private readonly name: string;

  private static callbacks: { [id: string]: (value: unknown) => void } = {};

  public static respond(rid: string, value: unknown): void {
    const [resource, id] = rid.split(':');
    if (resource !== GetCurrentResourceName()) {
      return null;
    }
    const handler = RPC.callbacks[id];
    if (!handler) {
      console.error(`no handler for ${id}`);
    }
    delete RPC.callbacks[id];
    handler(value);
  }

  public static get<T>(
    controller: string,
    method: string,
    ...args: unknown[]
  ): Promise<T> {
    return new Promise<T>(resolve => {
      const id = Random.uuid();
      this.callbacks[id] = resolve;
      emitNet(
        `vxf.rpc.request.${controller}`,
        method,
        `${GetCurrentResourceName()}:${id}`,
        ...args,
      );
    });
  }

  public static call(
    controller: string,
    method: string,
    ...args: unknown[]
  ): void {
    emitNet(`vxf.rpc.call.${controller}`, method, ...args);
  }

  public get<T>(method: string, ...args: unknown[]): Promise<T> {
    return RPC.get(this.name, method, ...args);
  }

  public call(method: string, ...args: unknown[]): void {
    return RPC.call(this.name, method, ...args);
  }
}
