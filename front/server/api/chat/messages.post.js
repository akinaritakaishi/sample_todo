import { addMessage } from '../../utils/chat-store'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const text = typeof body?.text === 'string' ? body.text.trim() : ''
  if (!text) {
    throw createError({ statusCode: 400, statusMessage: 'text is required' })
  }
  const author = typeof body?.author === 'string' && body.author.trim() ? body.author.trim() : 'あなた'
  return await addMessage({ author, text })
})
