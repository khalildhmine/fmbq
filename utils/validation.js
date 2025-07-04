import * as Yup from 'yup'

export const logInSchema = Yup.object().shape({
  email: Yup.string().required('账户邮箱必填').email('请输入正确邮箱'),
  password: Yup.string().required('请输入登录密码').min(6, '密码长度最小6位'),
})

export const registerSchema = Yup.object().shape({
  name: Yup.string().required('请输入账户名称').min(3, '账户名称最小三位'),
  email: Yup.string().required('账户邮箱必填').email('请输入正确邮箱'),
  password: Yup.string().required('请输入登录密码').min(6, '密码长度最小6位'),
  confirmPassword: Yup.string()
    .required('请再次输入确认密码')
    .oneOf([Yup.ref('password'), null], '确认密码有误'),
})

export const categorySchema = Yup.object().shape({
  name: Yup.string().required('类别名称不能为空'),
  slug: Yup.string().required('路径名不能为空'),
  image: Yup.string()
    .required('输入图片地址')
    .url('无效的图像地址')
    .matches(/\.(gif|jpe?g|png|webp)$/i, '图像地址必须是有效的图像URL'),
})

export const bannerSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  uri: Yup.string().required('URI is required'),
  isPublic: Yup.boolean().default(true),
  type: Yup.string().oneOf(['one', 'two']).required('Type is required'),
  image: Yup.object().shape({
    url: Yup.string().required('Image URL is required'),
  }),
})

export const sliderSchema = Yup.object().shape({
  title: Yup.string().required('名称不能为空'),
  image: Yup.object().shape({
    url: Yup.string()
      .required('请输入图片地址')
      .url('地址无效')
      .matches(/\.(gif|jpe?g|png|webp)$/i, '图像地址必须是有效的图像URL'),
  }),
})

export const reviewSchema = Yup.object().shape({
  title: Yup.string().required('评价标题不能为空').min(4, '评价标题不得少于4个字符'),
  comment: Yup.string().required('评价文字不能为空').min(4, '评价文字不应少于 4 个字符'),
})

export const addressSchema = Yup.object().shape({
  province: Yup.object().shape({
    name: Yup.string().required('请选择您居住的省份'),
  }),
  city: Yup.object().shape({
    name: Yup.string().required('请选择您的居住的城市'),
  }),
  area: Yup.object().shape({
    name: Yup.string().required('请选择您的居住的区县'),
  }),
  street: Yup.string().required('街道名称不能为空'),
  postalCode: Yup.string().required('请输入您的邮政编码'),
})

export const nameSchema = Yup.object().shape({
  name: Yup.string().required('必须登记姓名').min(3, '名字必须超过 3 个字符'),
})

export const mobileSchema = Yup.object().shape({
  mobile: Yup.string()
    .required('手机号码必须注册')
    .min(11, '手机号码必须为 11 位数字')
    .max(11, '手机号码必须为 11 位数字'),
})

export const productSchema = Yup.object().shape({
  name: Yup.string().required('产品名称不能为空').min(3, '产品名称不得少于3个字符'),
  description: Yup.string().required('产品描述不能为空').min(10, '产品描述不得少于10个字符'),
  price: Yup.number().required('价格不能为空').positive('价格必须为正数'),
  countInStock: Yup.number()
    .required('库存数量不能为空')
    .integer('库存必须为整数')
    .min(0, '库存不能为负数'),
  category: Yup.string().required('必须选择类别'),
  brand: Yup.string().required('品牌不能为空'),
  colors: Yup.array().min(1, '至少需要添加一种颜色'),
  sizes: Yup.array().min(1, '至少需要添加一种尺寸'),
  images: Yup.array().min(1, '至少需要添加一张图片'),
})
