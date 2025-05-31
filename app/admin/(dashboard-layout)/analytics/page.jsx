'use client'
import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material'
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { formatPrice } from '@/utils/formatters'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const randomColors = count => {
  const baseColors = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(199, 199, 199, 0.7)',
    'rgba(83, 102, 255, 0.7)',
    'rgba(40, 159, 64, 0.7)',
    'rgba(210, 199, 199, 0.7)',
  ]

  return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length])
}

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('month')
  const [revenueData, setRevenueData] = useState(null)
  const [productData, setProductData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch revenue data
        const revenueResponse = await fetch(`/api/admin/analytics/revenue?timeframe=${timeframe}`)
        if (!revenueResponse.ok) {
          throw new Error(`Revenue data fetch failed: ${revenueResponse.statusText}`)
        }
        const revenueResult = await revenueResponse.json()

        // Fetch product data
        const productResponse = await fetch(`/api/admin/analytics/products?timeframe=${timeframe}`)
        if (!productResponse.ok) {
          throw new Error(`Product data fetch failed: ${productResponse.statusText}`)
        }
        const productResult = await productResponse.json()

        setRevenueData(revenueResult.data)
        setProductData(productResult.data)
      } catch (err) {
        console.error('Error fetching analytics data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeframe])

  const handleTimeframeChange = event => {
    setTimeframe(event.target.value)
  }

  // Helper function to format revenue data for charts
  const getRevenueChartData = () => {
    if (!revenueData) return null

    return {
      labels: revenueData.dateLabels,
      datasets: [
        {
          label: 'Revenue',
          data: revenueData.revenueData,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    }
  }

  // Helper function to format category data for charts
  const getCategoryChartData = () => {
    if (!revenueData?.revenueByCategory) return null

    const categories = Object.keys(revenueData.revenueByCategory)
    const categoryValues = categories.map(cat => revenueData.revenueByCategory[cat])

    return {
      labels: categories,
      datasets: [
        {
          data: categoryValues,
          backgroundColor: randomColors(categories.length),
          borderWidth: 1,
        },
      ],
    }
  }

  // Helper function to format product data for charts
  const getTopProductsChartData = () => {
    if (!productData?.topSellingProducts) return null

    return {
      labels: productData.topSellingProducts.map(product => product.title),
      datasets: [
        {
          label: 'Units Sold',
          data: productData.topSellingProducts.map(product => product.quantitySold),
          backgroundColor: randomColors(productData.topSellingProducts.length),
          borderWidth: 1,
        },
      ],
    }
  }

  // Helper function to format product revenue data for charts
  const getProductRevenueChartData = () => {
    if (!productData?.topRevenueProducts) return null

    return {
      labels: productData.topRevenueProducts.map(product => product.title),
      datasets: [
        {
          label: 'Revenue',
          data: productData.topRevenueProducts.map(product => product.revenue),
          backgroundColor: randomColors(productData.topRevenueProducts.length),
          borderWidth: 1,
        },
      ],
    }
  }

  // Helper function to format category sales data
  const getCategorySalesChartData = () => {
    if (!productData?.categorySales) return null

    const categories = Object.keys(productData.categorySales)
    const salesValues = categories.map(cat => productData.categorySales[cat])

    return {
      labels: categories,
      datasets: [
        {
          data: salesValues,
          backgroundColor: randomColors(categories.length),
          borderWidth: 1,
        },
      ],
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" variant="h6">
          Error loading analytics: {error}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics Dashboard
        </Typography>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel id="timeframe-select-label">Timeframe</InputLabel>
          <Select
            labelId="timeframe-select-label"
            id="timeframe-select"
            value={timeframe}
            label="Timeframe"
            onChange={handleTimeframeChange}
          >
            <MenuItem value="week">Past Week</MenuItem>
            <MenuItem value="month">Past Month</MenuItem>
            <MenuItem value="quarter">Past Quarter</MenuItem>
            <MenuItem value="year">Past Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Revenue Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Total Revenue
              </Typography>
              <Typography variant="h4">{formatPrice(revenueData?.totalRevenue || 0)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Avg. Order Value
              </Typography>
              <Typography variant="h4">
                {formatPrice(revenueData?.averageOrderValue || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Products Sold
              </Typography>
              <Typography variant="h4">{productData?.totalUnitsSold || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Out of Stock
              </Typography>
              <Typography variant="h4">{productData?.outOfStockCount || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 4 }} />

      {/* Revenue Charts */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Revenue Analysis
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Trend
              </Typography>
              {revenueData?.revenueData && (
                <Box sx={{ height: 300 }}>
                  <Line
                    data={getRevenueChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue by Category
              </Typography>
              {revenueData?.revenueByCategory && (
                <Box sx={{ height: 300 }}>
                  <Doughnut
                    data={getCategoryChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 4 }} />

      {/* Product Analytics */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Product Analytics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Selling Products
              </Typography>
              {productData?.topSellingProducts && (
                <Box sx={{ height: 300 }}>
                  <Bar
                    data={getTopProductsChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                      indexAxis: 'y',
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Revenue Products
              </Typography>
              {productData?.topRevenueProducts && (
                <Box sx={{ height: 300 }}>
                  <Bar
                    data={getProductRevenueChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                      indexAxis: 'y',
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Category Sales Distribution
              </Typography>
              {productData?.categorySales && (
                <Box sx={{ height: 300 }}>
                  <Pie
                    data={getCategorySalesChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Low Stock Products
              </Typography>
              {productData?.lowStockProducts && (
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  <Stack spacing={2}>
                    {productData.lowStockProducts.map(product => (
                      <Box
                        key={product.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 1,
                          border: '1px solid #eee',
                          borderRadius: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            minWidth: 50,
                            mr: 2,
                            overflow: 'hidden',
                            borderRadius: 1,
                          }}
                        >
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: '100%',
                                height: '100%',
                                bgcolor: 'grey.200',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography variant="caption">No Image</Typography>
                            </Box>
                          )}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" noWrap>
                            {product.title}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {product.category}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              color: product.stock === 0 ? 'error.main' : 'warning.main',
                              fontWeight: 'bold',
                            }}
                          >
                            Stock: {product.stock}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
