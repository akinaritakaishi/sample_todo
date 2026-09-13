import { getMessages } from '../../utils/chat-store'

export default defineEventHandler(async () => {
  return await getMessages()
})
