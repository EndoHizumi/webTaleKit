import { AddHandler } from './AddHandler'
import { RemoveHandler } from './RemoveHandler'
import { ExecutionContext } from '../core/CommandRegistry'

const createContext = (): { context: ExecutionContext; addElement: jest.Mock; removeElement: jest.Mock } => {
  const addElement = jest.fn()
  const removeElement = jest.fn()
  const context = {
    core: {
      domElementHandler: { addElement, removeElement },
    },
  } as unknown as ExecutionContext
  return { context, addElement, removeElement }
}

describe('AddHandler', () => {
  it('domElementHandler.addElementにcommandをそのまま委譲する', async () => {
    const { context, addElement } = createContext()
    const command = { type: 'add', target: 'div', name: 'popup', class: 'my-popup' }
    await new AddHandler().execute(command, context)
    expect(addElement).toHaveBeenCalledWith(command)
  })
})

describe('RemoveHandler', () => {
  it('domElementHandler.removeElementにcommandをそのまま委譲する', async () => {
    const { context, removeElement } = createContext()
    const command = { type: 'remove', name: 'popup' }
    await new RemoveHandler().execute(command, context)
    expect(removeElement).toHaveBeenCalledWith(command)
  })
})
