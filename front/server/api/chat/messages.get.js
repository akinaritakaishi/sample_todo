import { getMessages } from '../../utils/chat-store'

defineRouteMeta({
  openAPI: {
    tags: ['chat'],
    summary: 'チャットメッセージ一覧を取得する',
    description: '指定チャンネルのメッセージを投稿順（古い順）で全件返す。',
    parameters: [
      {
        name: 'room',
        in: 'query',
        required: false,
        description: '取得するチャンネルのID。省略時は"general"',
        schema: { type: 'string' },
      },
    ],
    responses: {
      200: {
        description: 'メッセージ一覧',
        content: {
          'application/json': {
            schema: { type: 'array', items: { $ref: '#/components/schemas/ChatMessage' } },
          },
        },
      },
    },
  },
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const room = typeof query.room === 'string' ? query.room.trim() : ''
  return await getMessages(room)
})
