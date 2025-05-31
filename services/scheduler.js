import cron from 'node-cron'
import { usersRepo } from '@/helpers'
import { NotificationService } from './notifications.service'

export const initScheduledJobs = () => {
  // Check abandoned carts every day at 10 AM
  cron.schedule('0 10 * * *', async () => {
    try {
      const usersWithCart = await usersRepo.getUsersWithAbandonedCarts(24) // 24 hours threshold

      for (const user of usersWithCart) {
        await NotificationService.sendCartReminder(user)
      }
    } catch (error) {
      console.error('Cart reminder job failed:', error)
    }
  })
}
