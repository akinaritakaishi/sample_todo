import { getMessages } from '../../utils/chat-store'

defineRouteMeta({
  openAPI: {
    tags: ['chat'],
    summary: 'チャットメッセージ一覧を取得する',
    description: '投稿順（古い順）で全件返す。',
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

export default defineEventHandler(async () => {
  return await getMessages()
})
