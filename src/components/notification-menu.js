import { NotificationService } from '../services/notification-service.js';

export class NotificationMenu {
    static async render(userId) {
        const notifications = await NotificationService.getNotifications(
            userId
        );

        return `
            <div class="notifications-menu" id="notifications-menu">
                <div class="notifications-header">
                    <h3>Bildirimler</h3>
                </div>
                <div class="notifications-list" id="notifications-list">
                    ${
                        notifications.length > 0
                            ? notifications
                                  .map((notification) => {
                                      if (
                                          notification.type ===
                                              'follow_request' &&
                                          notification.status === 'pending'
                                      ) {
                                          return `
                                <div class="notification-item" data-notification-id="${notification.id}">
                                    <p><strong>${notification.senderUsername}</strong> sizi takip etmek istiyor</p>
                                    <div class="notification-actions">
                                        <button onclick="acceptFollowRequest('${notification.id}', '${notification.senderUserId}')">
                                            Kabul Et
                                        </button>
                                        <button onclick="rejectFollowRequest('${notification.id}', '${notification.senderUserId}')">
                                            Reddet
                                        </button>
                                    </div>
                                </div>
                            `;
                                      }
                                      return '';
                                  })
                                  .join('')
                            : '<p class="no-notifications">Bildirim yok</p>'
                    }
                </div>
            </div>
        `;
    }
}

export default NotificationMenu;
