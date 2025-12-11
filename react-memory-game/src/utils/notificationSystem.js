import { LocalNotifications } from '@capacitor/local-notifications';
import { getSpecificMessages, getRandomMessage } from '../data/notificationMessages';

export const NotificationSystem = {
    // Request permissions
    requestPermissions: async () => {
        try {
            const result = await LocalNotifications.requestPermissions();
            return result.display === 'granted';
        } catch (error) {
            console.warn("Notification permissions not available (likely browser env)", error);
            return false;
        }
    },

    // Initialize and schedule daily notifications
    // This is called on app launch to refresh the messages for the future
    scheduleDailyNotifications: async (username = "Player") => {
        try {
            // 1. Cancel valid pending notifications to replace them?
            // Actually, if we want to rotate messages, we should cancel old ones.
            // But we probably want to keep the schedule. 
            // Strategy: Cancel everything and re-schedule for "Tomorrow" and "Every Day" thereafter?
            // Or just schedule for Next Occurrence.
            // Easiest for rotating messages: Cancel all, then schedule for today/tomorrow at specific times.

            // Let's check permissions first implicitly by trying or assume app handles it.

            // Cancel all pending to avoid duplicates and refresh text
            await LocalNotifications.cancel({ notifications: [{ id: 1 }, { id: 2 }, { id: 3 }] });

            // Get 3 unique random messages
            const messages = getSpecificMessages(3, username);

            // Define times: 7:00, 12:00, 19:00 (7 PM)
            const times = [
                { id: 1, hour: 7, minute: 0 },
                { id: 2, hour: 12, minute: 0 },
                { id: 3, hour: 19, minute: 0 }
            ];

            const notifications = times.map((time, index) => {
                const message = messages[index];
                const now = new Date();
                const scheduleDate = new Date();
                scheduleDate.setHours(time.hour, time.minute, 0, 0);

                // If time has passed today, schedule for tomorrow
                if (scheduleDate <= now) {
                    scheduleDate.setDate(scheduleDate.getDate() + 1);
                }

                return {
                    id: time.id,
                    title: message.title,
                    body: message.body,
                    schedule: {
                        at: scheduleDate,
                        repeats: true, // Repeats daily at this time
                        every: 'day'
                    },
                    sound: null,
                    attachments: null,
                    actionTypeId: "",
                    extra: null
                };
            });

            await LocalNotifications.schedule({ notifications });
            console.log(" Daily notifications scheduled:", notifications);
            return true;

        } catch (error) {
            console.warn("Failed to schedule notifications (likely browser env)", error);
            return false;
        }
    }
};
