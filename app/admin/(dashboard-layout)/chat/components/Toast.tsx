import { motion, AnimatePresence } from 'framer-motion'
import { FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'loading'
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const icons = {
    success: <FiCheckCircle className="h-5 w-5" />,
    error: <FiAlertCircle className="h-5 w-5" />,
    loading: <FiLoader className="h-5 w-5 animate-spin" />,
  }

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    loading: 'bg-blue-500',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2`}
    >
      {icons[type]}
      <span>{message}</span>
    </motion.div>
  )
}

export default Toast
