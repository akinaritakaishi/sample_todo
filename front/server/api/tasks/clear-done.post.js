import { clearDoneTasks } from '../../utils/task-store'

export default defineEventHandler(async () => {
  return await clearDoneTasks()
})
