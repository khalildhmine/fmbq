module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class', 'class'],
  theme: {
  	extend: {
  		fontFamily: {},
  		boxShadow: {
  			'3xl': '0 0 10px 3px rgba(0,0,0,0.08)',
  			fashion: '0 10px 30px -10px rgba(0, 0, 0, 0.4)',
  			glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
  		},
  		colors: {
  			fashion: {
  				purple: {
  					light: '#9d4edd',
  					DEFAULT: '#8338ec',
  					dark: '#7209b7'
  				},
  				pink: {
  					light: '#ff70a6',
  					DEFAULT: '#ff3e9d',
  					dark: '#e31c79'
  				},
  				black: {
  					light: '#2a2a2a',
  					DEFAULT: '#1a1a1a',
  					dark: '#0a0a0a'
  				}
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		backgroundImage: {
  			'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))'
  		},
  		backdropBlur: {
  			xs: '2px'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	},
  	container: {
  		center: true
  	}
  },
  plugins: [require('@tailwindcss/forms'), require('tailwind-scrollbar'), require("tailwindcss-animate")],
}
