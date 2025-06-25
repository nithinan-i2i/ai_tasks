# User Notification System (Task 5)

## Overview
The User Notification System provides in-app and email notifications for user-related events. It is modular, testable, and follows best practices for error handling, validation, and logging.

## Architecture
- **Model:** `src/models/NotificationModel.js` — Defines the notification schema.
- **Service:** `src/services/NotificationService.js` — Handles notification logic and delivery.
- **Controller:** `src/controllers/NotificationController.js` — Exposes RESTful API endpoints.
- **Routes:** `src/routes/notificationRoutes.js` — Wires endpoints to controller methods.
- **Integration:** User actions (e.g., registration) in `UserController.js` trigger notifications.

## API Endpoints
| Method | Endpoint                    | Description                        |
|--------|-----------------------------|------------------------------------|
| GET    | /notifications              | List user notifications            |
| POST   | /notifications/mark-read    | Mark notifications as read         |
| DELETE | /notifications/:id          | Delete a notification              |

### Example: Mark as Read
```json
POST /notifications/mark-read
{
  "ids": ["notifId1", "notifId2"]
}
```

## Integration Points
- **User Registration:** After a user registers, a welcome notification is sent.
- **Email Notifications:** Uses `MessageService` for email delivery.

## Usage Example
```js
// In UserController.js
const user = await userService.registerUser(req.body);
await NotificationService.sendInAppNotification(user._id, 'Welcome to the platform!');
```

## Testing
- Unit tests: `__tests__/notification.test.js` (Jest, mocks dependencies)
- Covers: in-app/email notification, error handling, invalid input

## Extension Notes
- Add more notification types by extending the `type` field in the model.
- Integrate with other user actions (e.g., password reset) as needed.
- For email delivery, consider using a dedicated `EmailAdapter` service.

## Error Handling & Logging
- All layers use consistent error handling and log important events/errors via the logger utility.

---
For further details, see code comments and JSDoc in each file. 