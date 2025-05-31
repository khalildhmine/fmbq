import { useState, useEffect } from 'react'
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Grid,
  Typography,
  Paper,
} from '@mui/material'
import { useGetCategoriesQuery } from '@/store/services'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  slug: Yup.string()
    .required('Slug is required')
    .matches(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .min(2, 'Slug must be at least 2 characters')
    .max(50, 'Slug must not exceed 50 characters'),
  description: Yup.string().max(500, 'Description must not exceed 500 characters'),
  level: Yup.number().required('Level is required').oneOf([1, 2], 'Level must be 1 or 2'),
  parent: Yup.string().when('level', {
    is: 2,
    then: Yup.string().required('Parent category is required for level 2'),
    otherwise: Yup.string().nullable(),
  }),
  isActive: Yup.boolean().default(true),
})

export default function CategoryForm({
  mode = 'create',
  selectedCategory,
  updateHandler,
  isLoading,
}) {
  const { data: categories } = useGetCategoriesQuery(undefined, {
    selectFromResult: ({ data }) => ({
      data: data?.data?.filter(category => category.level === 1) || [],
    }),
  })

  const formik = useFormik({
    initialValues: {
      name: selectedCategory?.name || '',
      slug: selectedCategory?.slug || '',
      description: selectedCategory?.description || '',
      level: selectedCategory?.level || 1,
      parent: selectedCategory?.parent?._id || '',
      isActive: selectedCategory?.isActive ?? true,
    },
    validationSchema,
    onSubmit: values => {
      updateHandler(values)
    },
  })

  useEffect(() => {
    if (selectedCategory) {
      formik.setValues({
        name: selectedCategory.name,
        slug: selectedCategory.slug,
        description: selectedCategory.description,
        level: selectedCategory.level,
        parent: selectedCategory.parent?._id || '',
        isActive: selectedCategory.isActive,
      })
    }
  }, [selectedCategory])

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Category Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              id="slug"
              name="slug"
              label="Slug"
              value={formik.values.slug}
              onChange={formik.handleChange}
              error={formik.touched.slug && Boolean(formik.errors.slug)}
              helperText={formik.touched.slug && formik.errors.slug}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              multiline
              rows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="level-label">Level</InputLabel>
              <Select
                labelId="level-label"
                id="level"
                name="level"
                value={formik.values.level}
                onChange={formik.handleChange}
                error={formik.touched.level && Boolean(formik.errors.level)}
              >
                <MenuItem value={1}>Level 1 (Main Category)</MenuItem>
                <MenuItem value={2}>Level 2 (Subcategory)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {formik.values.level === 2 && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="parent-label">Parent Category</InputLabel>
                <Select
                  labelId="parent-label"
                  id="parent"
                  name="parent"
                  value={formik.values.parent}
                  onChange={formik.handleChange}
                  error={formik.touched.parent && Boolean(formik.errors.parent)}
                >
                  {categories?.map(category => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.isActive}
                  onChange={e => formik.setFieldValue('isActive', e.target.checked)}
                  name="isActive"
                />
              }
              label="Active"
            />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button variant="outlined" onClick={() => formik.resetForm()} disabled={isLoading}>
                Reset
              </Button>
              <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
                {mode === 'create' ? 'Create Category' : 'Update Category'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  )
}
