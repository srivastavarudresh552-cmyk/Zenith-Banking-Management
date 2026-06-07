# 🚀 Quick Reference - Banking Frontend

## Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Project Structure

```
src/
├── pages/           # 6 Page Components
├── components/      # 4 Reusable Components
├── contexts/        # AuthContext
├── services/        # API service with Axios
├── hooks/           # useForm hook
├── utils/           # Helper functions
├── router/          # Routing configuration
├── App.jsx          # Main component
└── main.jsx         # Entry point
```

## Pages

| Page | URL | Auth Required | Purpose |
|------|-----|--------------|---------|
| Home | `/` | No | Landing page |
| Login | `/login` | No | User login |
| Register | `/register` | No | User registration |
| Dashboard | `/dashboard` | Yes | Main dashboard |
| Accounts | `/accounts` | Yes | View accounts |
| Transfer | `/transfer` | Yes | Transfer money |

## API Endpoints

### Auth
- `POST /auth/register` - Register
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout

### Accounts
- `POST /accounts` - Create
- `GET /accounts` - Get all
- `GET /accounts/balance/:id` - Get balance

### Transactions
- `POST /transactions` - Create transfer
- `POST /transactions/system/initial-funds` - Add funds

## Key Components

### Navbar
```jsx
<Navbar /> // Navigation bar with user menu
```

### Alert
```jsx
<Alert type="error|success|info" message="Text" />
```

### ProtectedRoute
```jsx
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

## useAuth Hook

```jsx
const { user, token, isAuthenticated, login, register, logout } = useAuth();
```

## useForm Hook

```jsx
const { formData, handleChange, handleSubmit, loading, error, success } = 
  useForm(initialState, onSubmit);
```

## CSS Classes

```
Buttons:     .btn-primary, .btn-secondary, .btn-danger, .btn-outline
Forms:       .input-field, .form-group, .form-label
Cards:       .card
Alerts:      .alert-error, .alert-success, .alert-info
Layout:      .container-max
```

## Environment Variables

```
VITE_API_URL=http://localhost:3000/api
```

## Styling with Tailwind

```jsx
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
  Click me
</button>
```

## Common Tasks

### Add a New Page

1. Create file in `src/pages/MyPage.jsx`
2. Add route in `src/router/index.jsx`
3. Import in router config
4. Add to navigation if needed

### Add a New Component

1. Create file in `src/components/MyComponent.jsx`
2. Export from `src/components/index.js`
3. Import and use in pages

### Make API Call

```javascript
import { api, accountAPI } from '../services/api';

// Use pre-configured methods
const accounts = await accountAPI.getUserAccounts();

// Or make custom call
const response = await api.get('/custom-endpoint');
```

### Add Form with Validation

```jsx
import { useForm } from '../hooks/useForm';

const MyForm = () => {
  const { formData, handleChange, handleSubmit } = useForm(
    { email: '' },
    async (data) => {
      // Submit logic
    }
  );

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
        className="input-field"
      />
    </form>
  );
};
```

## Debugging

### Console Logs
- API responses logged automatically
- Check Network tab in DevTools

### Common Issues
- Port 5173 in use → `npm run dev -- --port 3001`
- Module not found → `npm install`
- Build errors → Clear cache: `rm -rf dist node_modules && npm install`

## File Sizes

| File | Size |
|------|------|
| Bundle | 352 KB |
| Gzipped | 112 KB |
| CSS | 26.40 KB |
| JS | 215.48 KB |

## Browser Support

✅ Chrome  
✅ Firefox  
✅ Safari  
✅ Edge  

## Performance Tips

1. Use React DevTools for debugging
2. Check Lighthouse score
3. Lazy load routes if needed
4. Minimize API calls
5. Cache responses when possible

## Security Notes

- Never commit `.env` with sensitive data
- Always use HTTPS in production
- Keep dependencies updated
- Validate all user inputs
- Never expose tokens in URLs

## Useful Links

- [React Dev](https://react.dev)
- [Vite Docs](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Axios](https://axios-http.com)

---

**Last Updated**: 2026-06-05  
**Version**: 1.0.0  
