export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

export function sendLocalNotification(title: string, options?: NotificationOptions): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }

  if (Notification.permission !== 'granted') {
    return false
  }

  try {
    new Notification(title, {
      icon: '/apple-touch-icon.png',
      badge: '/icon.svg',
      ...options,
    })
    return true
  } catch (err) {
    console.warn('Could not display local notification', err)
    return false
  }
}

export function scheduleHabitReminder(habitTitle: string, timeStr: string): void {
  // Save to stored scheduled reminders
  try {
    const raw = localStorage.getItem('catalyst_scheduled_reminders')
    const list = raw ? JSON.parse(raw) : []
    list.push({ title: habitTitle, time: timeStr, createdAt: Date.now() })
    localStorage.setItem('catalyst_scheduled_reminders', JSON.stringify(list))
  } catch {}

  // If permission is already granted, fire confirmation preview
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    sendLocalNotification(`⏰ Reminder set: ${habitTitle}`, {
      body: `We will nudge you at ${timeStr} for your morning routine.`,
    })
  }
}
