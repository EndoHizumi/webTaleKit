import { CommandHandler, ExecutionContext, ScenarioCommand } from '../core/CommandRegistry'

export class SayHandler implements CommandHandler {
  async execute(command: ScenarioCommand, context: ExecutionContext): Promise<void> {
    const { core, scenarioManager } = context
    const line = command
    // say(name:string, pattern: string, voice: {playの引数},  ...text)
    if (line.voice) await core.soundHandler({ path: line.voice, play: true })
    await core.textHandler({ content: line.content, name: line.name, speed: line.speed || 25 })
    scenarioManager.setHistory(line)
  }
}
