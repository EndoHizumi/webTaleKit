type EventHandler<T = any> = (data: T) => any

export class EventBus {
  private handlers: Map<string, EventHandler[]>

  constructor() {
    this.handlers = new Map()
  }

  on<T = any>(event: string, handler: EventHandler<T>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, [])
    }
    this.handlers.get(event)!.push(handler as EventHandler)
  }

  off<T = any>(event: string, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler as EventHandler)
      if (index !== -1) {
        handlers.splice(index, 1)
      }
    }
  }

  async emit<T = any>(event: string, data?: T): Promise<any[]> {
    const handlers = this.handlers.get(event) || []
    const results: any[] = []
    for (const handler of handlers) {
      results.push(await handler(data))
    }
    return results
  }
}
