import { getTasks } from '../../utils/task-store'

defineRouteMeta({
  openAPI: {
    $global: {
      components: {
        schemas: {
          Task: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              title: { type: 'string' },
              due: {
                type: 'string',
                description: 'ISO形式の日付文字列（YYYY-MM-DD）。期限未設定の場合は空文字。',
                example: '2026-09-13',
              },
              done: { type: 'boolean' },
            },
            required: ['id', 'title', 'due', 'done'],
          },
          CreateTaskRequest: {
            type: 'object',
            properties: {
              title: { type: 'string', minLength: 1 },
              due: {
                type: 'string',
                description: 'ISO形式の日付文字列（YYYY-MM-DD）。省略可。',
              },
            },
            required: ['title'],
          },
          UpdateTaskDoneRequest: {
            type: 'object',
            properties: { done: { type: 'boolean' } },
            required: ['done'],
          },
          ChatMessage: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              author: { type: 'string' },
              text: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
            required: ['id', 'author', 'text', 'createdAt'],
          },
          CreateChatMessageRequest: {
            type: 'object',
            properties: {
              author: { type: 'string', description: '省略時は「あなた」になる。' },
              text: { type: 'string', minLength: 1 },
            },
            required: ['text'],
          },
          Error: {
            type: 'object',
            properties: {
              statusCode: { type: 'integer' },
              statusMessage: { type: 'string' },
            },
            required: ['statusCode', 'statusMessage'],
          },
        },
      },
    },
    tags: ['tasks'],
    summary: 'タスク一覧を取得する',
    description: '保存済みのタスクが無い場合はシードデータ（server/data/seed-tasks.json）から生成して返す。',
    responses: {
      200: {
        description: 'タスク一覧',
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
  return await getTasks()
})
