type EventHandler<T = unknown> = (data: T) => unknown

export class EventBus {
  private handlers: Map<string, EventHandler[]>

  constructor() {
    this.handlers = new Map()
  }

  on<T = unknown>(event: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, [])
    }
    this.handlers.get(event)!.push(handler as EventHandler)
  }

  off<T = unknown>(event: string, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler as EventHandler)
      if (index !== -1) {
        handlers.splice(index, 1)
      }
    }
  }

  async emit<T = unknown>(event: string, data?: T): Promise<unknown[]> {
    const handlers = this.handlers.get(event) || []
    const results: unknown[] = []
    for (const handler of handlers) {
      results.push(await handler(data))
    }
    return results
  }
}
