# Banking Frontend - Setup & Usage Guide

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 16+ installed
- Backend API running on `http://localhost:3000`

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API URL (Optional)
Edit `.env` if your backend is running on a different URL:
```
VITE_API_URL=http://localhost:3000/api
```

### 4. Start Development Server
```bash
npm run dev
```
Your app will be available at `http://localhost:5173`

### 5. Login/Register
- Register a new account or use existing credentials
- Create an account to start transferring funds

## 📁 Project Structure

```
Banking_Frontend/
├── src/
│   ├── pages/                  # All page components
│   │   ├── HomePage.jsx        # Landing page
│   │   ├── LoginPage.jsx       # Login form
│   │   ├── RegisterPage.jsx    # Registration form
│   │   ├── DashboardPage.jsx   # Main dashboard
│   │   ├── AccountsPage.jsx    # View/manage accounts
│   │   └── TransferPage.jsx    # Money transfer form
│   ├── components/             # Reusable components
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── Alert.jsx           # Error/Success alerts
│   │   ├── ProtectedRoute.jsx  # Auth protection
│   │   └── index.js            # Barrel export
│   ├── contexts/               # React Context
│   │   └── AuthContext.jsx     # Authentication state
│   ├── services/               # API services
│   │   └── api.js              # Axios configuration
│   ├── hooks/                  # Custom hooks
│   │   └── useForm.js          # Form management hook
│   ├── utils/                  # Utility functions
│   │   └── helpers.js          # Helper functions
│   ├── router/                 # Routing
│   │   ├── index.jsx           # Router configuration
│   │   └── Layout.jsx          # Main layout
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── public/                     # Static files
├── .env                        # Environment variables
├── .env.example                # Example env file
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind CSS config
├── postcss.config.js           # PostCSS config
└── README.md                   # Project README
```

## 🔑 Key Features

### 1. Authentication System
- Register with email/password/name
- Login with email/password
- JWT token stored in localStorage
- Automatic token injection in API requests
- Protected routes for authenticated users
- Auto-logout on token expiration

### 2. Account Management
- Create multiple bank accounts
- View all your accounts
- Check real-time balance
- Masked account IDs for security

### 3. Money Transfers
- Transfer between your accounts
- Form validation (amount, accounts)
- Insufficient balance checks
- Idempotency key for safe transactions
- Real-time balance updates
- Transaction summary preview

### 4. User Interface
- Responsive design (mobile/tablet/desktop)
- Professional styling with Tailwind CSS
- Loading spinners during operations
- Alert messages for feedback
- Intuitive navigation

## 📊 API Integration

### Auth Endpoints
```
POST   /api/auth/register      # Create account
POST   /api/auth/login         # Login user
POST   /api/auth/logout        # Logout user
```

### Account Endpoints
```
POST   /api/accounts           # Create account
GET    /api/accounts           # Get all accounts
GET    /api/accounts/balance/:id  # Get balance
```

### Transaction Endpoints
```
POST   /api/transactions       # Create transfer
POST   /api/transactions/system/initial-funds  # Initial funds
```

## 🛠️ Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🔧 Configuration Files

### .env
```
VITE_API_URL=http://localhost:3000/api
```

### vite.config.js
Vite bundler configuration for optimal development and production builds.

### tailwind.config.js
Tailwind CSS configuration - defines content paths for utility class scanning.

### postcss.config.js
PostCSS configuration with Tailwind CSS plugin.

## 🎨 Styling

- **Framework**: Tailwind CSS v4
- **Custom Components**: Button variants, form elements, alerts
- **Responsive**: Mobile-first approach
- **Dark Mode Ready**: Can be extended

### Available CSS Classes

```
Buttons:
.btn-primary      # Blue primary button
.btn-secondary    # Green secondary button
.btn-danger       # Red danger button
.btn-outline      # Outlined button

Forms:
.input-field      # Styled input with focus ring
.form-group       # Input wrapper with margin
.form-label       # Form label styling

Cards:
.card             # Shadowed card with hover effect

Alerts:
.alert-error      # Red error alert
.alert-success    # Green success alert
.alert-info       # Blue info alert

Layout:
.container-max    # Max-width container with padding
```

## 🔒 Security Features

- JWT authentication
- Protected routes
- Token refresh handling
- Account masking (****1234)
- Input validation
- CORS support
- Secure localStorage management

## 📱 Responsive Design

- **Mobile** (< 768px): Hamburger menu, stack layout
- **Tablet** (768px - 1024px): Multi-column layout
- **Desktop** (> 1024px): Full layout

## 🚨 Error Handling

- API errors displayed to users
- Form validation with helpful messages
- Network error handling
- Automatic redirect on auth errors
- Loading states prevent double submission

## 🎯 Best Practices

1. **Code Organization**: Separate concerns into different folders
2. **Reusable Components**: Avoid code duplication
3. **State Management**: Use Context API for global state
4. **API Calls**: Centralized in services folder
5. **Styling**: Consistent use of Tailwind utilities
6. **Performance**: Efficient re-renders with React hooks

## 🐛 Troubleshooting

### Port 5173 already in use
```bash
# Kill the process on port 5173 or use a different port
npm run dev -- --port 3001
```

### API connection errors
- Ensure backend is running on `http://localhost:3000`
- Check `.env` file for correct API URL
- Clear browser cache and localStorage

### Build errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Styles not loading
- Check if Tailwind CSS plugin is installed
- Verify `index.css` imports are correct
- Clear browser cache

## 📚 Useful Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [React Router Documentation](https://reactrouter.com)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Axios Documentation](https://axios-http.com)

## 🎓 Learning Endpoints

Use these URLs to understand the application:

1. **Home Page**: `http://localhost:5173/`
2. **Login**: `http://localhost:5173/login`
3. **Register**: `http://localhost:5173/register`
4. **Dashboard**: `http://localhost:5173/dashboard` (Protected)
5. **Accounts**: `http://localhost:5173/accounts` (Protected)
6. **Transfer**: `http://localhost:5173/transfer` (Protected)

## 📝 Notes

- Ensure backend API is running before starting frontend
- First-time users need to register before accessing dashboard
- Each user can have multiple accounts
- Transfers are between personal accounts only
- All transactions include unique idempotency keys

## ✅ Verification Checklist

- [ ] Node.js 16+ installed
- [ ] Backend API running on port 3000
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Development server started (`npm run dev`)
- [ ] Can register/login successfully
- [ ] Can create accounts
- [ ] Can transfer between accounts
- [ ] Balances update in real-time
- [ ] Can logout successfully
- [ ] App builds successfully (`npm run build`)

## 🚀 Production Deployment

```bash
# Build production bundle
npm run build

# Preview production build
npm run preview

# Deploy dist/ folder to hosting service
# (Netlify, Vercel, GitHub Pages, etc.)
```

## 💡 Next Steps

1. Customize branding and colors
2. Add transaction history view
3. Implement account statements
4. Add file download features
5. Implement notifications
6. Add dark mode toggle
7. Enhance mobile experience
8. Add unit and integration tests

---

Happy Banking! 🏦💰
