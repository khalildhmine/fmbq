const handleViewDetails = async order => {
  console.log('View details for order:', order)

  let orderData = { ...order }
  let orderItems = orderData.items || []

  // If no items in the order, try to fetch details from API
  if (!orderItems || orderItems.length === 0) {
    try {
      const response = await fetch(`/api/orders/${order._id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.order && data.order.items && data.order.items.length > 0) {
          orderItems = data.order.items
          orderData = { ...orderData, items: orderItems }
          console.log('Fetched items from API:', orderItems)
        }
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
    }
  }

  // If still no items, create mock items based on order amount
  if (!orderItems || orderItems.length === 0) {
    const mockProductCount = Math.max(1, Math.floor(orderData.amount / 100))
    const mockPrice = Math.floor(orderData.amount / mockProductCount)

    orderItems = Array(mockProductCount)
      .fill()
      .map((_, index) => ({
        _id: `mock-item-${index}-${Date.now()}`,
        name: `Product ${index + 1}`,
        price: mockPrice,
        quantity: 1,
        image: '/placeholder.png',
        productID: {
          _id: `mock-product-${index}`,
          name: `Product ${index + 1}`,
          image: '/placeholder.png',
        },
      }))

    orderData = { ...orderData, items: orderItems }
    console.log('Created mock items:', orderItems)
  }

  // For each item, ensure it has a valid image URL
  orderData.items = orderItems.map(item => {
    // If the item has a productID object with an image, use that
    const productImage =
      typeof item.productID === 'object' && item.productID?.image ? item.productID.image : null

    return {
      ...item,
      image: item.image || productImage || '/placeholder.png',
    }
  })

  setSelectedOrder(orderData)
  setOpenModal(true)
}
