import { getTasks } from '../../utils/task-store'

export default defineEventHandler(async () => {
  return await getTasks()
})
