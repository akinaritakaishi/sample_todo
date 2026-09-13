import { addMessage } from '../../utils/chat-store'

defineRouteMeta({
  openAPI: {
    tags: ['chat'],
    summary: 'チャットメッセージを投稿する',
    description: 'mcp-server/のMCPサーバーからもこのエンドポイントを呼び出してメッセージを投稿する。',
    requestBody: {
      required: true,
      content: {
        'application/json': { schema: { $ref: '#/components/schemas/CreateChatMessageRequest' } },
      },
    },
    responses: {
      200: {
        description: '投稿されたメッセージ',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ChatMessage' } } },
      },
      400: {
        description: 'textが空、または未指定',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },
  },
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const text = typeof body?.text === 'string' ? body.text.trim() : ''
  if (!text) {
    throw createError({ statusCode: 400, statusMessage: 'text is required' })
  }
  const author = typeof body?.author === 'string' && body.author.trim() ? body.author.trim() : 'あなた'
  return await addMessage({ author, text })
})
