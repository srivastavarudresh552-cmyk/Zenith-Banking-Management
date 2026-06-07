# Banking Frontend - React + Vite

A modern, professional banking application built with React, Vite, Tailwind CSS, React Router, and Axios. This frontend integrates with a Node.js/Express banking backend API.

## Features

✅ **Authentication**
- User registration and login
- JWT token-based authentication
- Protected routes
- Automatic logout on token expiration

✅ **Account Management**
- Create multiple accounts
- View all user accounts
- Real-time balance tracking
- Masked account ID display for security

✅ **Money Transfers**
- Transfer money between your accounts
- Form validation and error handling
- Idempotency key generation for safe transactions
- Real-time balance updates
- Transaction summary before submission

✅ **User Interface**
- Responsive design (mobile, tablet, desktop)
- Professional Tailwind CSS styling
- Loading states and spinners
- Alert components for feedback
- Intuitive navigation

## Project Structure

```
src/
├── pages/              # Page components
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── DashboardPage.jsx
│   ├── AccountsPage.jsx
│   └── TransferPage.jsx
├── components/         # Reusable components
│   ├── Navbar.jsx
│   ├── Alert.jsx
│   ├── ProtectedRoute.jsx
│   └── index.js
├── contexts/           # React Context
│   └── AuthContext.jsx
├── services/           # API services
│   └── api.js
├── hooks/              # Custom hooks
│   └── useForm.js
├── utils/              # Utility functions
│   └── helpers.js
├── router/             # Router configuration
│   ├── index.jsx
│   └── Layout.jsx
├── styles/             # Global styles
├── App.jsx
├── main.jsx
└── index.css
```

## Installation

### Prerequisites
- Node.js 16+ installed
- Backend API running on `http://localhost:3000`

### Setup Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your API URL if needed.

3. **Start development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## API Endpoints Integration

The frontend integrates with the following backend endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Accounts
- `POST /api/accounts` - Create new account
- `GET /api/accounts` - Get all user accounts
- `GET /api/accounts/balance/:accountId` - Get account balance

### Transactions
- `POST /api/transactions` - Create transfer transaction
- `POST /api/transactions/system/initial-funds` - Add initial funds

## Key Technologies

- **React 19.2** - UI library
- **Vite 8.0** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS 3** - Utility-first CSS framework
- **Context API** - State management

## Authentication Flow

1. User registers or logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Token added to all subsequent requests via interceptor
5. Protected routes check authentication status
6. Automatic redirect to login on token expiration

## Form Validation

- Email validation (standard email format)
- Password validation (minimum 6 characters)
- Required field validation
- Account selection validation
- Amount validation (positive numbers)
- Sufficient balance check

## State Management

- **AuthContext** - Handles user authentication state
- **localStorage** - Persists token and user info
- **Component State** - Local form and UI state
- **Axios Interceptors** - Global request/response handling

## Security Features

- JWT token-based authentication
- Token stored securely (localStorage)
- Protected routes for authenticated users
- CORS enabled for API requests
- Input validation and sanitization
- Account masking for display

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm preview

# Run linter
npm run lint
```

## Configuration Files

- **vite.config.js** - Vite configuration
- **tailwind.config.js** - Tailwind CSS configuration
- **postcss.config.js** - PostCSS configuration
- **.env** - Environment variables

## Error Handling

- API error messages displayed to users
- Form validation errors
- Network error handling
- Automatic logout on 401 responses
- Loading states during async operations

## Performance Optimizations

- Code splitting via React Router
- Lazy loading of routes
- CSS-in-JS optimization with Tailwind
- Efficient re-renders using React hooks
- Minimized bundle size with Vite

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This is a demonstration project. Feel free to fork and customize for your needs.

## License

MIT License - Feel free to use for personal or commercial projects.

## Support

For issues or questions, please check the backend API documentation and ensure it's running correctly on port 3000.
