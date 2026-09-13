import { addTask } from '../../utils/task-store'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const title = typeof body?.title === 'string' ? body.title.trim() : ''
  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'title is required' })
  }
  const due = typeof body?.due === 'string' ? body.due : ''
  return await addTask({ title, due })
})
