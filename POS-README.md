# 🛒 POS System - Point of Sale

A professional, clean, and efficient Point of Sale system integrated into your e-commerce backend.

## ✨ Features

### 🔍 **Product Scanning**
- **Barcode Scanner Integration**: Works with physical barcode scanners
- **Manual Entry**: Type product ID, SKU, or barcode manually
- **Auto-focus**: Scanner input automatically focuses for continuous scanning
- **Real-time Validation**: Instantly checks product availability and stock

### 🛍️ **Shopping Cart Management**
- **Dynamic Cart**: Add/remove items with quantity controls
- **Stock Validation**: Prevents overselling with real-time stock checks
- **Price Calculation**: Automatic total calculation with tax support
- **Item Management**: Easy quantity adjustment and removal

### 💳 **Payment Processing**
- **Multiple Payment Methods**:
  - 💰 Cash
  - 🏦 Bankili
  - 💳 Sedad
  - 📱 Masrvi
- **Secure Transactions**: All payments processed securely
- **Receipt Generation**: Professional receipts with order details

### 👥 **Customer Management**
- **Customer Information**: Capture name, phone, and email
- **Walk-in Support**: Default customer for quick transactions
- **Contact Details**: Store customer information for future reference

### 📊 **Inventory Management**
- **Real-time Stock Updates**: Automatically deducts sold items
- **Stock Validation**: Prevents sales when stock is insufficient
- **Inventory Tracking**: Maintains accurate stock levels

### 🖨️ **Receipt System**
- **Professional Receipts**: Clean, printable receipt format
- **Order Details**: Complete itemized receipt with totals
- **Print Support**: Browser-based printing functionality
- **Digital Receipts**: Store receipts in the system

## 🚀 Quick Start

### 1. **Installation**
```bash
# Run the POS setup script
node scripts/install-pos.js

# Or manually install dependencies
npm install react-hot-toast axios react-icons
```

### 2. **Access POS System**
- Navigate to `/admin/pos` in your admin dashboard
- Or click "POS System" in the admin sidebar

### 3. **Start Scanning**
- Focus the scanner input field
- Scan product barcodes or enter product IDs manually
- Products automatically add to cart
- Adjust quantities as needed

### 4. **Process Payment**
- Enter customer information
- Select payment method
- Click "Proceed to Pay"
- Generate and print receipt

## 🔧 API Endpoints

### **Scan Product**
```http
POST /api/pos/scan
Content-Type: application/json

{
  "productId": "product_barcode_or_id",
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "product": {
    "_id": "product_id",
    "name": "Product Name",
    "price": 29.99,
    "salePrice": 24.99,
    "stock": 50,
    "category": "Electronics",
    "brand": "Brand Name"
  }
}
```

### **Process Checkout**
```http
POST /api/pos/checkout
Content-Type: application/json

{
  "items": [
    {
      "productId": "product_id",
      "name": "Product Name",
      "price": 24.99,
      "quantity": 2,
      "total": 49.98
    }
  ],
  "totalAmount": 49.98,
  "paymentMethod": "cash",
  "customerInfo": {
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "_id": "order_id",
    "receiptNumber": "POS-1234567890-ABC12",
    "totalAmount": 49.98,
    "items": [...],
    "customerInfo": {...},
    "paymentMethod": "cash",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🎯 Usage Workflow

### **1. Product Scanning**
```
Scanner Input → Product Lookup → Stock Check → Add to Cart
```

### **2. Cart Management**
```
Add Items → Adjust Quantities → Review Total → Customer Info
```

### **3. Payment Processing**
```
Select Payment Method → Process Payment → Generate Receipt → Update Inventory
```

### **4. Receipt Generation**
```
Order Complete → Receipt Modal → Print Receipt → Close Transaction
```

## 🛠️ Technical Details

### **Frontend Technologies**
- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **React Icons**: Professional icon library

### **Backend Integration**
- **Next.js API Routes**: Serverless API endpoints
- **MongoDB/Mongoose**: Database operations
- **Authentication**: Secure admin access
- **Real-time Updates**: Live inventory management

### **Scanner Integration**
- **Auto-focus**: Input automatically focuses for continuous scanning
- **Barcode Support**: Works with standard barcode scanners
- **Manual Entry**: Fallback for manual product entry
- **Validation**: Real-time product and stock validation

## 🔒 Security Features

- **Admin Authentication**: Only authenticated users can access POS
- **Stock Validation**: Prevents overselling and inventory issues
- **Secure Transactions**: All payment data handled securely
- **Audit Trail**: Complete order history and tracking

## 📱 Responsive Design

- **Desktop Optimized**: Full-featured desktop interface
- **Mobile Friendly**: Responsive design for tablets and mobile
- **Touch Support**: Optimized for touch devices
- **Keyboard Navigation**: Full keyboard accessibility

## 🚨 Error Handling

- **Stock Validation**: Clear messages for insufficient stock
- **Product Not Found**: Helpful error messages for invalid scans
- **Network Errors**: Graceful handling of API failures
- **User Feedback**: Toast notifications for all actions

## 🔄 Future Enhancements

- **Offline Mode**: Work without internet connection
- **Multi-language Support**: International language support
- **Advanced Analytics**: Sales reports and analytics
- **Customer Database**: Customer relationship management
- **Inventory Alerts**: Low stock notifications
- **Bulk Operations**: Import/export functionality

## 📞 Support

For technical support or feature requests:
- Check the admin dashboard for system status
- Review API responses for error details
- Ensure all dependencies are properly installed
- Verify database connectivity

## 🎉 Getting Started

1. **Run the setup script**: `node scripts/install-pos.js`
2. **Start your server**: `npm run dev`
3. **Navigate to POS**: `/admin/pos`
4. **Start scanning products** and processing sales!

---

**Your professional POS system is ready to handle real-world retail operations! 🚀**
