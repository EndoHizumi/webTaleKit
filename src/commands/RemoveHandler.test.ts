import { RemoveHandler } from './RemoveHandler'
import { ExecutionContext } from '../core/CommandRegistry'

const createContext = (): { context: ExecutionContext; removeElement: jest.Mock } => {
  const removeElement = jest.fn()
  const context = {
    core: {
      domElementHandler: { removeElement },
    },
  } as unknown as ExecutionContext
  return { context, removeElement }
}

describe('RemoveHandler', () => {
  it('domElementHandler.removeElementにcommandをそのまま委譲する', async () => {
    const { context, removeElement } = createContext()
    const command = { type: 'remove', name: 'popup' }
    await new RemoveHandler().execute(command, context)
    expect(removeElement).toHaveBeenCalledWith(command)
  })
})
