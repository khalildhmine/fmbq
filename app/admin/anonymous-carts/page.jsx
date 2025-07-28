'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'

const AnonymousCartsPage = () => {
  const [carts, setCarts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCart, setSelectedCart] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchCarts = async () => {
      try {
        const response = await axios.get('/api/admin/anonymous-carts')
        setCarts(response.data.carts)
      } catch (error) {
        console.error('Error fetching anonymous carts:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCarts()
  }, [])

  const openModal = cart => {
    setSelectedCart(cart)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSelectedCart(null)
    setIsModalOpen(false)
  }

  if (loading) {
    return <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>Loading...</div>
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginBottom: 20, fontWeight: '700', fontSize: 24 }}>Anonymous Carts</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>User ID</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Cart ID</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Email</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Phone</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Device OS</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Device Model</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Total Items</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Total Price</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Action</th>{' '}
            {/* Added Action column */}
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Last Updated</th>
            <th style={{ border: '1px solid #ddd', padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {carts.map(cart => (
            <tr key={cart._id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: 8, maxWidth: 150, overflowWrap: 'break-word' }}>
                {cart.userId || 'N/A'}
              </td>
              <td style={{ padding: 8, maxWidth: 150, overflowWrap: 'break-word' }}>
                {cart.cartId || 'N/A'}
              </td>
              <td style={{ padding: 8 }}>{cart.contactInfo?.email || 'N/A'}</td>
              <td style={{ padding: 8 }}>{cart.contactInfo?.phone || 'N/A'}</td>
              <td style={{ padding: 8 }}>{cart.PhoneInfo?.deviceOS || 'N/A'}</td>
              <td style={{ padding: 8 }}>{cart.PhoneInfo?.deviceModel || 'N/A'}</td>
              <td style={{ padding: 8, textAlign: 'center' }}>{cart.totalItems}</td>
              <td style={{ padding: 8, textAlign: 'right' }}>{cart.totalPrice.toLocaleString()}</td>
              <td style={{ padding: 8 }}>{cart.action || 'N/A'}</td> {/* Show action */}
              <td style={{ padding: 8 }}>{new Date(cart.updatedAt).toLocaleString()}</td>
              <td style={{ padding: 8 }}>
                <button
                  onClick={() => openModal(cart)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  View Items
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && selectedCart && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              padding: 20,
              borderRadius: 8,
              maxWidth: 800,
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'none',
                border: 'none',
                fontSize: 28,
                cursor: 'pointer',
                color: '#333',
              }}
              aria-label="Close modal"
            >
              &times;
            </button>
            <h2 style={{ marginBottom: 12 }}>Cart Details</h2>
            <p>
              <strong>User ID:</strong> {selectedCart.userId || 'N/A'}
            </p>
            <p>
              <strong>Cart ID:</strong> {selectedCart.cartId || 'N/A'}
            </p>
            <p>
              <strong>Email:</strong> {selectedCart.contactInfo?.email || 'N/A'}
            </p>
            <p>
              <strong>Phone:</strong> {selectedCart.contactInfo?.phone || 'N/A'}
            </p>
            <p>
              <strong>Device OS:</strong> {selectedCart.PhoneInfo?.deviceOS || 'N/A'}
            </p>
            <p>
              <strong>Device Model:</strong> {selectedCart.PhoneInfo?.deviceModel || 'N/A'}
            </p>
            <p>
              <strong>Total Items:</strong> {selectedCart.totalItems}
            </p>
            <p>
              <strong>Total Price:</strong> {selectedCart.totalPrice.toLocaleString()}
            </p>
            <p>
              <strong>Action:</strong> {selectedCart.action || 'N/A'}
            </p> {/* Show action in modal */}
            <p>
              <strong>Last Updated:</strong> {new Date(selectedCart.updatedAt).toLocaleString()}
            </p>
            <h3 style={{ marginTop: 20, marginBottom: 8 }}>Items</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', textAlign: 'left' }}>
                  <th style={{ border: '1px solid #ddd', padding: 8 }}>Image</th>
                  <th style={{ border: '1px solid #ddd', padding: 8 }}>Product ID</th>
                  <th style={{ border: '1px solid #ddd', padding: 8 }}>Name</th>
                  <th style={{ border: '1px solid #ddd', padding: 8 }}>Quantity</th>
                  <th style={{ border: '1px solid #ddd', padding: 8 }}>Price</th>
                  <th style={{ border: '1px solid #ddd', padding: 8 }}>Color</th>
                  <th style={{ border: '1px solid #ddd', padding: 8 }}>Size</th>
                </tr>
              </thead>
              <tbody>
                {selectedCart.items?.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ border: '1px solid #ddd', padding: 8, width: 60, height: 60 }}>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 50,
                            height: 50,
                            backgroundColor: '#eee',
                            borderRadius: 4,
                          }}
                        />
                      )}
                    </td>
                    <td
                      style={{
                        border: '1px solid #ddd',
                        padding: 8,
                        maxWidth: 120,
                        overflowWrap: 'break-word',
                      }}
                    >
                      {item.productID}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: 8 }}>{item.name}</td>
                    <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'center' }}>
                      {item.quantity}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: 8, textAlign: 'right' }}>
                      {(item.finalPrice || item.price).toLocaleString()}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: 8 }}>
                      {item.color?.name || 'N/A'}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: 8 }}>
                      {item.size?.size || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnonymousCartsPage
