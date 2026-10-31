import assert from 'node:assert/strict'
import { leaveAndDelete } from '../src/client/delete-flow.ts'

const calls = []
let finishNavigation
const navigation = new Promise(resolve => { finishNavigation = resolve })
const ui = {
  async archiveSession(id, options) { calls.push(['archive', id, options.stopActivity]) },
  async openWorkspace(id) { calls.push(['open', id]); await navigation },
  startSession() { calls.push(['start']) },
}
const result = leaveAndDelete(ui, 'session-1', 'workspace-1', async id => { calls.push(['delete', id]); return true })
await new Promise(resolve => setTimeout(resolve, 0))
assert.deepEqual(calls, [['archive', 'session-1', true], ['open', 'workspace-1']])
finishNavigation()
assert.equal(await result, true)
assert.deepEqual(calls.at(-1), ['delete', 'session-1'])

const failure = []
await assert.rejects(leaveAndDelete({ ...ui, async openWorkspace() { throw new Error('navigation failed') } }, 'session-2', 'workspace-1', async () => { failure.push('deleted'); return true }))
assert.deepEqual(failure, [])
console.log('delete navigation tests passed')
