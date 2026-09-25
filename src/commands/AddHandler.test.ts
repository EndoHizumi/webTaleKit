import { AddHandler } from './AddHandler'
import { ExecutionContext } from '../core/CommandRegistry'

const createContext = (): { context: ExecutionContext; addElement: jest.Mock } => {
  const addElement = jest.fn()
  const context = {
    core: {
      domElementHandler: { addElement },
    },
  } as unknown as ExecutionContext
  return { context, addElement }
}

describe('AddHandler', () => {
  it('domElementHandler.addElementにcommandをそのまま委譲する', async () => {
    const { context, addElement } = createContext()
    const command = { type: 'add', target: 'div', name: 'popup', class: 'my-popup' }
    await new AddHandler().execute(command, context)
    expect(addElement).toHaveBeenCalledWith(command)
  })
})
