import { deleteTask } from '../../utils/task-store'

defineRouteMeta({
  openAPI: {
    tags: ['tasks'],
    summary: 'タスクを削除する',
    description: '指定したidのタスクが存在しない場合も冪等に成功扱いとする。',
    responses: {
      200: {
        description: '削除結果',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { ok: { type: 'boolean', example: true } },
              required: ['ok'],
            },
          },
        },
      },
    },
  },
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  await deleteTask(id)
  return { ok: true }
})
