import { addTask } from '../../utils/task-store'

defineRouteMeta({
  openAPI: {
    tags: ['tasks'],
    summary: 'タスクを追加する',
    requestBody: {
      required: true,
      content: {
        'application/json': { schema: { $ref: '#/components/schemas/CreateTaskRequest' } },
      },
    },
    responses: {
      200: {
        description: '追加されたタスク',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } },
      },
      400: {
        description: 'titleが空、または未指定',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const title = typeof body?.title === 'string' ? body.title.trim() : ''
  if (!title) {
    throw createError({ statusCode: 400, statusMessage: 'title is required' })
  }
  const due = typeof body?.due === 'string' ? body.due : ''
  return await addTask({ title, due })
})
