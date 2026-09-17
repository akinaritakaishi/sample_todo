import rooms from '../../data/chat-rooms.json'

defineRouteMeta({
  openAPI: {
    tags: ['chat'],
    summary: 'チャンネル一覧を取得する',
    description: '固定のチャンネル一覧（id・表示名・アイコン）を返す。ユーザーによる作成・編集はできない。',
    responses: {
      200: {
        description: 'チャンネル一覧',
        content: {
          'application/json': {
            schema: { type: 'array', items: { $ref: '#/components/schemas/ChatRoom' } },
          },
        },
      },
    },
  },
})

export default defineEventHandler(() => rooms)
