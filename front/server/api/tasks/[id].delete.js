import { deleteTask } from '../../utils/task-store'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  await deleteTask(id)
  return { ok: true }
})
