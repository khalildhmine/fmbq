'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import { getAuthHeaders, getAuthFetchOptions, authFetch } from '@/utils/auth'

// VideosTable component
const VideosTable = ({ videos, onEdit, onDelete, onView }) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table sx={{ minWidth: 650 }} aria-label="videos table">
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell>Title</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Perfume</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Views</TableCell>
            <TableCell>Likes</TableCell>
            <TableCell>Created</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {videos && videos.length > 0 ? (
            videos.map(video => (
              <TableRow key={video._id} hover>
                <TableCell sx={{ maxWidth: 200 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      component="img"
                      src={video.thumbnailUrl}
                      alt={video.title}
                      sx={{
                        width: 50,
                        height: 30,
                        objectFit: 'cover',
                        marginRight: 2,
                        borderRadius: 1,
                      }}
                    />
                    <Typography variant="body2" noWrap title={video.title}>
                      {video.title}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={video.type}
                    size="small"
                    color={
                      video.type === 'Persi'
                        ? 'primary'
                        : video.type === 'Japan'
                          ? 'success'
                          : video.type === 'Diana London'
                            ? 'secondary'
                            : 'default'
                    }
                  />
                </TableCell>
                <TableCell>{video.perfumeName || 'N/A'}</TableCell>
                <TableCell>
                  {Math.floor(video.duration / 60)}:
                  {(video.duration % 60).toString().padStart(2, '0')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={video.status}
                    size="small"
                    color={
                      video.status === 'published'
                        ? 'success'
                        : video.status === 'draft'
                          ? 'warning'
                          : 'error'
                    }
                  />
                </TableCell>
                <TableCell>{video.views?.toLocaleString() || 0}</TableCell>
                <TableCell>{video.likes?.toLocaleString() || 0}</TableCell>
                <TableCell>
                  {video.createdAt ? format(new Date(video.createdAt), 'MMM d, yyyy') : 'N/A'}
                </TableCell>
                <TableCell align="right">
                  <IconButton color="info" size="small" onClick={() => onView(video)} title="View">
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => onEdit(video)}
                    title="Edit"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => onDelete(video)}
                    title="Delete"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} align="center">
                No videos found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

// VideoForm component for create/edit
const VideoForm = ({ video, onSubmit, onCancel, isPending, perfumes }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Persi',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: 30,
    status: 'published',
    featured: false,
    perfumeId: '',
    tags: '',
  })

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || '',
        type: video.type || 'Persi',
        description: video.description || '',
        videoUrl: video.videoUrl || '',
        thumbnailUrl: video.thumbnailUrl || '',
        duration: video.duration || 30,
        status: video.status || 'published',
        featured: video.featured || false,
        perfumeId: video.perfumeId || '',
        tags: video.tags?.join(', ') || '',
      })
    }
  }, [video])

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    // Process tags from comma-separated string to array
    const processedData = {
      ...formData,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
    }
    onSubmit(processedData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            name="title"
            label="Title"
            fullWidth
            required
            value={formData.title}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Type</InputLabel>
            <Select name="type" value={formData.type} onChange={handleChange} label="Type">
              <MenuItem value="Persi">Persi</MenuItem>
              <MenuItem value="Japan">Japan</MenuItem>
              <MenuItem value="Diana London">Diana London</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Perfume</InputLabel>
            <Select
              name="perfumeId"
              value={formData.perfumeId}
              onChange={handleChange}
              label="Perfume"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {perfumes?.map(perfume => (
                <MenuItem key={perfume._id} value={perfume._id}>
                  {perfume.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="description"
            label="Description"
            fullWidth
            required
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="videoUrl"
            label="Video URL"
            fullWidth
            required
            value={formData.videoUrl}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="thumbnailUrl"
            label="Thumbnail URL"
            fullWidth
            required
            value={formData.thumbnailUrl}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            name="duration"
            label="Duration (seconds)"
            fullWidth
            required
            type="number"
            value={formData.duration}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth required>
            <InputLabel>Status</InputLabel>
            <Select name="status" value={formData.status} onChange={handleChange} label="Status">
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <Typography component="div" variant="body2" sx={{ mb: 1 }}>
              Featured
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
              />
              <label htmlFor="featured" style={{ marginLeft: 8 }}>
                Mark as featured
              </label>
            </Box>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="tags"
            label="Tags (comma separated)"
            fullWidth
            value={formData.tags}
            onChange={handleChange}
            helperText="E.g. luxury, fragrance, summer"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isPending}
          startIcon={isPending && <CircularProgress size={20} />}
        >
          {video ? 'Update' : 'Create'} Video
        </Button>
      </Box>
    </form>
  )
}

// VideoPreview component
const VideoPreview = ({ video, onClose }) => {
  if (!video) return null

  return (
    <Dialog open={!!video} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Video Preview: {video.title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <video
            width="100%"
            controls
            poster={video.thumbnailUrl}
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          >
            <source src={video.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Box>
        <Typography variant="h6">{video.title}</Typography>
        <Box sx={{ my: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip label={video.type} color="primary" size="small" />
          {video.perfumeName && <Chip label={video.perfumeName} size="small" />}
          <Chip
            label={`${Math.floor(video.duration / 60)}:${(video.duration % 60)
              .toString()
              .padStart(2, '0')}`}
            size="small"
          />
          <Chip label={`${video.views?.toLocaleString() || 0} views`} size="small" />
          <Chip label={`${video.likes?.toLocaleString() || 0} likes`} size="small" />
        </Box>
        <Typography variant="body1" paragraph>
          {video.description}
        </Typography>
        {video.tags?.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
            {video.tags.map(tag => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// Main page component
export default function VideosPage() {
  const [videos, setVideos] = useState([])
  const [perfumes, setPerfumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [loadingTimeout, setLoadingTimeout] = useState(null)
  const router = useRouter()

  // Fetch videos with better error handling and timeout
  const fetchVideos = async (skipLoading = false) => {
    try {
      if (!skipLoading) {
        setLoading(true)
      }

      // Add a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (loading) {
          setError('Request is taking too long. The server might be unavailable.')
          setLoading(false)
        }
      }, 15000) // 15 second timeout

      setLoadingTimeout(timeoutId)

      const response = await fetch('/api/admin/maison-adrar/videos', {
        headers: getAuthHeaders(),
        ...getAuthFetchOptions(),
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch videos')
      }

      setVideos(data.data.videos || [])
      setError(null)
      setRetryCount(0)
    } catch (err) {
      console.error('Error fetching videos:', err)
      setError(err.message || 'Failed to load videos')

      // Show mock data if fetch fails after multiple retries
      if (retryCount >= 2) {
        setVideos(getMockVideos())
        toast.error('Using fallback data - connection to server failed')
      } else {
        toast.error('Failed to load videos. Retrying...')
        setRetryCount(prev => prev + 1)
        setTimeout(() => fetchVideos(true), 3000) // Retry after 3 seconds
      }
    } finally {
      setLoading(false)
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
    }
  }

  // Generate mock videos for fallback
  const getMockVideos = () => {
    return [
      {
        _id: 'mock1',
        title: 'Luxury Persi Fragrance Overview',
        type: 'Persi',
        description: 'An elegant overview of our luxury Persi collection',
        thumbnailUrl: 'https://via.placeholder.com/640x360?text=Persi+Fragrance',
        videoUrl: '#',
        duration: 180,
        status: 'published',
        views: 2450,
        likes: 128,
        featured: true,
        createdAt: new Date().toISOString(),
        tags: ['luxury', 'persi', 'fragrance'],
      },
      {
        _id: 'mock2',
        title: 'Diana London Summer Collection',
        type: 'Diana London',
        description: 'Explore our new Diana London summer collection',
        thumbnailUrl: 'https://via.placeholder.com/640x360?text=Diana+London',
        videoUrl: '#',
        duration: 240,
        status: 'published',
        views: 1820,
        likes: 95,
        featured: false,
        createdAt: new Date().toISOString(),
        tags: ['summer', 'diana london', 'collection'],
      },
    ]
  }

  // Fetch perfumes with better error handling
  const fetchPerfumes = async () => {
    try {
      const response = await fetch('/api/admin/maison-adrar', {
        headers: getAuthHeaders(),
        ...getAuthFetchOptions(),
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch perfumes')
      }

      setPerfumes(data.data.perfumes || [])
    } catch (err) {
      console.error('Error fetching perfumes:', err)
      toast.error('Failed to load perfumes list')
      // Set mock perfumes as fallback
      setPerfumes([
        { _id: 'mock-p1', name: 'Luxury Oud' },
        { _id: 'mock-p2', name: 'Floral Bloom' },
        { _id: 'mock-p3', name: 'Oriental Magic' },
      ])
    }
  }

  useEffect(() => {
    fetchVideos()
    fetchPerfumes()

    return () => {
      // Clean up any pending timeouts
      if (loadingTimeout) {
        clearTimeout(loadingTimeout)
      }
    }
  }, [])

  // Handle create
  const handleCreateVideo = async formData => {
    try {
      setIsPending(true)

      const response = await fetch('/api/admin/maison-adrar/videos', {
        method: 'POST',
        headers: getAuthHeaders(),
        ...getAuthFetchOptions(),
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to create video')
      }

      toast.success('Video created successfully')
      setOpenCreateDialog(false)
      fetchVideos() // Refresh the list
    } catch (err) {
      console.error('Error creating video:', err)
      toast.error(err.message || 'Failed to create video')
    } finally {
      setIsPending(false)
    }
  }

  // Handle update with improved error handling
  const handleUpdateVideo = async formData => {
    try {
      setIsPending(true)

      const response = await fetch(`/api/admin/maison-adrar/videos/${selectedVideo._id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        ...getAuthFetchOptions(),
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to update video')
      }

      toast.success('Video updated successfully')
      setOpenEditDialog(false)
      setSelectedVideo(null)
      fetchVideos() // Refresh the list
    } catch (err) {
      console.error('Error updating video:', err)
      toast.error(err.message || 'Failed to update video')
    } finally {
      setIsPending(false)
    }
  }

  // Handle delete with improved error handling
  const handleConfirmDelete = async () => {
    try {
      setIsPending(true)

      const response = await fetch(`/api/admin/maison-adrar/videos/${selectedVideo._id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        ...getAuthFetchOptions(),
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to delete video')
      }

      toast.success('Video deleted successfully')
      setOpenDeleteDialog(false)
      setSelectedVideo(null)
      fetchVideos() // Refresh the list
    } catch (err) {
      console.error('Error deleting video:', err)
      toast.error(err.message || 'Failed to delete video')
    } finally {
      setIsPending(false)
    }
  }

  // Manual retry function that users can trigger
  const handleRetry = () => {
    setError(null)
    fetchVideos()
    fetchPerfumes()
  }

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Maison Adrar Videos
        </Typography>
        <Box>
          {error && (
            <Button variant="outlined" color="secondary" onClick={handleRetry} sx={{ mr: 2 }}>
              Retry Connection
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
          >
            Add New Video
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 5 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading videos... Please wait
          </Typography>
        </Box>
      ) : videos.length > 0 ? (
        <VideosTable
          videos={videos}
          onEdit={video => {
            setSelectedVideo(video)
            setOpenEditDialog(true)
          }}
          onDelete={video => {
            setSelectedVideo(video)
            setOpenDeleteDialog(true)
          }}
          onView={video => {
            setSelectedVideo(video)
            setOpenPreviewDialog(true)
          }}
        />
      ) : (
        <Alert severity="info">
          No videos found. Click "Add New Video" to create your first video.
        </Alert>
      )}

      {/* Create Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Video</DialogTitle>
        <DialogContent>
          <VideoForm
            onSubmit={handleCreateVideo}
            onCancel={() => setOpenCreateDialog(false)}
            isPending={isPending}
            perfumes={perfumes}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Video</DialogTitle>
        <DialogContent>
          <VideoForm
            video={selectedVideo}
            onSubmit={handleUpdateVideo}
            onCancel={() => setOpenEditDialog(false)}
            isPending={isPending}
            perfumes={perfumes}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Video</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the video "{selectedVideo?.title}"? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            disabled={isPending}
            startIcon={isPending && <CircularProgress size={20} />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <VideoPreview
        video={selectedVideo}
        onClose={() => setOpenPreviewDialog(false)}
        open={openPreviewDialog}
      />
    </div>
  )
}
