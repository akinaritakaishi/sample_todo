import { setTaskDone } from '../../utils/task-store'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const task = await setTaskDone(id, Boolean(body?.done))
  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'task not found' })
  }
  return task
})
