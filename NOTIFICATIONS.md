# Order Notification System

The Shop App includes a real-time notification system that alerts administrators when new orders are placed. This document describes how the system works and how to test it.

## How It Works

The notification system uses two complementary approaches to ensure administrators receive timely alerts about new orders:

1. **WebSocket Notifications**: Provides instant, real-time notifications.
2. **Polling API**: Acts as a fallback mechanism when WebSockets aren't available.

### Notification Features

- **Visual Notifications**: Bell icon with unread count, toast notifications, notification panel
- **Audio Alerts**: Sound notifications for new orders
- **Navigation**: Click on a notification to navigate directly to the related order

## Testing the Notification System

### Prerequisites

- Ensure the Shop App is running in development mode: `npm run dev`
- Have the admin panel open in your browser

### Method 1: Using the Test Script

1. Open a new terminal window
2. Navigate to the project root directory
3. Run: `node scripts/test-order-notification.js`
4. Watch for notifications in the admin dashboard

### Method 2: Placing an Order Normally

1. Log in as a regular user
2. Add items to cart
3. Proceed to checkout
4. Complete the order process
5. Switch to the admin dashboard to see the notification

### Method 3: Using the API Directly

You can manually trigger a notification by sending a POST request to `/api/orders` with the appropriate data. For example:

```bash
curl -X POST https://fmbq.vercel.app/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test_token" \
  -d '{
    "cart": [{
      "productID": "test_product_1",
      "name": "Test Product",
      "quantity": 1,
      "price": 99.99,
      "discount": 10,
      "color": { "id": "color1", "name": "Blue", "hashCode": "#0000FF" },
      "size": { "id": "size1", "size": "M" },
      "image": "/placeholder.png"
    }],
    "address": {
      "street": "123 Test Street",
      "area": "Test Area",
      "city": "Test City"
    },
    "paymentMethod": "Cash on Delivery",
    "totalItems": 1,
    "totalPrice": 99.99,
    "totalDiscount": 10,
    "mobile": "+9999999999"
  }'
```

## Troubleshooting

If notifications aren't working, check the following:

1. **Browser Console**: Look for WebSocket connection errors
2. **Server Logs**: Check for any errors related to order creation or WebSocket messages
3. **Notification Permissions**: Ensure browser notifications are enabled
4. **Sound**: Make sure your device isn't muted

By default, the notification system will try both WebSockets and polling, so at least one method should work.

## Technical Details

- WebSocket connection is established in the `NotificationSystem.jsx` component
- Order creation in `/api/orders/route.js` triggers notifications
- Global state tracks new orders for the polling mechanism
- Demo notification appears on first load to confirm system is working 