import { setTaskDone } from '../../utils/task-store'

defineRouteMeta({
  openAPI: {
    tags: ['tasks'],
    summary: 'タスクの完了状態を切り替える',
    requestBody: {
      required: true,
      content: {
        'application/json': { schema: { $ref: '#/components/schemas/UpdateTaskDoneRequest' } },
      },
    },
    responses: {
      200: {
        description: '更新後のタスク',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } },
      },
      404: {
        description: '指定したidのタスクが存在しない',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const task = await setTaskDone(id, Boolean(body?.done))
  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'task not found' })
  }
  return task
})
