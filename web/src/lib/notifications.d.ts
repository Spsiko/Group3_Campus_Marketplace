export declare function sendNotificationToUser(targetUserId: string, // who receives the notification
action: string, // the text message
triggeredByUserId?: string): Promise<void>;
