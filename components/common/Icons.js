import React from 'react'
import {
  Edit,
  Trash2,
  Plus,
  Heart,
  ShoppingCart,
  Search,
  User,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  X,
  Check,
  AlertTriangle,
  Settings,
  LogOut,
  Menu,
  Grid,
  List,
} from 'lucide-react'

// Create an Icons object that contains all the icons we need
const Icons = {
  // Basic actions
  Edit: props => <Edit {...props} />,
  Delete: props => <Trash2 {...props} />,
  Plus: props => <Plus {...props} />,
  Close: props => <X {...props} />,
  Check: props => <Check {...props} />,
  Warning: props => <AlertTriangle {...props} />,

  // Shopping
  Heart: props => <Heart {...props} />,
  Cart: props => <ShoppingCart {...props} />,

  // Navigation
  Search: props => <Search {...props} />,
  User: props => <User {...props} />,
  Settings: props => <Settings {...props} />,
  LogOut: props => <LogOut {...props} />,
  Menu: props => <Menu {...props} />,

  // Chevrons
  ChevronLeft: props => <ChevronLeft {...props} />,
  ChevronRight: props => <ChevronRight {...props} />,
  ChevronUp: props => <ChevronUp {...props} />,
  ChevronDown: props => <ChevronDown {...props} />,

  // Layout
  Grid: props => <Grid {...props} />,
  List: props => <List {...props} />,
}

export default Icons
