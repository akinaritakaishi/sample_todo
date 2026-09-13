import { clearDoneTasks } from '../../utils/task-store'

defineRouteMeta({
  openAPI: {
    tags: ['tasks'],
    summary: '完了済みのタスクを一括削除する',
    responses: {
      200: {
        description: '削除後に残っているタスク一覧',
        content: {
          'application/json': {
            schema: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
          },
        },
      },
    },
  },
})

export default defineEventHandler(async () => {
  return await clearDoneTasks()
})
