# Contacts Management System - Frontend

A modern React-based contacts management application with user authentication and full CRUD operations for managing personal contacts.

## Features

- **User Authentication**: Secure login and registration with JWT token management
- **Contact Management**: Create, read, update, and delete personal contacts
- **Phone Validation**: Numeric-only phone input with 10-20 digit validation
- **Search & Filter**: Search contacts by name or phone number
- **Responsive Design**: Mobile-first design with modern UI components
- **Error Handling**: Comprehensive error handling with user-friendly French messages
- **Real-time Validation**: Client-side validation with immediate feedback
- **Modern UI**: Clean, professional interface with smooth animations

## Project Structure

```
client/
├── public/                     # Static assets
│   ├── index.html             # Main HTML template
│   └── manifest.json          # PWA manifest file
├── src/                       # Source code
│   ├── api/                   # API configuration
│   │   └── AxiosInstance.js   # Axios configuration with auth interceptors
│   ├── components/            # Reusable components (empty - ready for expansion)
│   ├── pages/                 # Main application pages
│   │   ├── Home.js            # Landing/welcome page
│   │   ├── Login.js           # User authentication page
│   │   ├── Register.js        # User registration page
│   │   └── Contacts.js        # Main contacts management page
│   ├── services/              # API service layer
│   │   ├── AuthService.js     # Authentication API calls
│   │   └── ContactsService.js # Contacts CRUD operations
│   ├── styles/                # Component-specific stylesheets
│   │   ├── Auth.css           # Authentication pages styling
│   │   ├── Contacts.css       # Contacts management styling
│   │   └── Home.css           # Home page styling
│   ├── utils/                 # Utility functions
│   │   └── ApiHandleError.js  # Centralized error handling utility
│   ├── App.js                 # Main application component with routing
│   ├── App.css                # Global application styles
│   ├── App.test.js            # Application tests
│   ├── index.js               # Application entry point
│   ├── index.css              # Global CSS reset and base styles
│   ├── setupTests.js          # Test configuration
│   └── reportWebVitals.js     # Performance monitoring
├── package.json               # Dependencies and npm scripts
├── package-lock.json          # Dependency lock file
└── README.md                  # Project documentation
```

## Prerequisites

Before starting, ensure you have:

- **Node.js** (version 16.0 or higher)
- **npm** (version 8.0 or higher) or **yarn**
- **Git** (for version control)
- **Backend API** running on `http://127.0.0.1:3080`

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/LEWAN1311/MyContactsClient.git
cd client
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```

Using yarn:
```bash
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
REACT_APP_API_BASE_URL=http://127.0.0.1:3080
REACT_APP_APP_NAME=Contacts Management
```

## Development

### Start Development Server

```bash
npm start
```

The application will automatically open at [http://localhost:3000](http://localhost:3000)

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Runs the app in development mode with hot reload |
| `npm build` | Creates production build in `build` folder |
| `npm test` | Launches the test runner in interactive mode |
| `npm eject` | Ejects from Create React App (irreversible) |

## Build and Deployment

### Production Build

```bash
npm run build
```

This creates an optimized `build` folder ready for production deployment.

### Deployment Options

#### 1. Static Hosting Services

**Netlify:**
```bash
npm run build
# Drag and drop build folder to Netlify dashboard
```

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**GitHub Pages:**
```bash
npm install --save-dev gh-pages
npm run build
npx gh-pages -d build
```

#### 2. Traditional Web Server

**Apache/Nginx:**
```bash
npm run build
# Copy build folder contents to web server directory
sudo cp -r build/* /var/www/html/
```

#### 3. Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t contacts-app .
docker run -p 80:80 contacts-app
```

## Dependencies

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^19.1.1 | UI library |
| `react-dom` | ^19.1.1 | React rendering |
| `react-router-dom` | ^7.9.1 | Client-side routing |
| `axios` | ^1.12.2 | HTTP client for API calls |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react-scripts` | ^0.0.0 | Create React App build tools |
| `@testing-library/react` | ^16.3.0 | React testing utilities |
| `@testing-library/jest-dom` | ^6.8.0 | Jest DOM matchers |
| `@testing-library/user-event` | ^13.5.0 | User interaction testing |
| `web-vitals` | ^2.1.4 | Performance monitoring |

## Configuration

### API Configuration

The API base URL is configured in `src/api/AxiosInstance.js`:

```javascript
const AxiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:3080/',
    headers: {
        "Content-Type": "application/json",
    },
});
```

### Authentication Flow

1. **Login/Register** → JWT token received from server
2. **Token Storage** → Stored in `localStorage`
3. **Auto-attachment** → Added to all API requests via Axios interceptors
4. **Logout** → Token removed from storage

### Error Handling Architecture

Centralized error handling in `src/utils/ApiHandleError.js`:

```javascript
// Handles different HTTP status codes
- 400: Validation errors (phone format, etc.)
- 401: Authentication errors
- 403: Authorization errors
- 404: Resource not found
- 405: Method not allowed
- 409: Duplicate resource (phone/email)
- 500: Server errors
```

## Styling Architecture

### CSS Organization

- **Global Styles**: `src/index.css` - CSS reset and base styles
- **App Styles**: `src/App.css` - Application-wide styles
- **Component Styles**: `src/styles/` - Page-specific stylesheets

### Design System

- **Color Palette**: Modern gradients and consistent colors
- **Typography**: Clean, readable font hierarchy
- **Spacing**: Consistent margin and padding system
- **Responsive**: Mobile-first design approach
- **Animations**: Smooth transitions and hover effects

## Development Guidelines

### Code Organization

```
src/
├── api/          # External API configuration
├── components/   # Reusable UI components
├── pages/        # Route-level components
├── services/     # Business logic and API calls
├── styles/       # Component-specific styles
└── utils/        # Helper functions and utilities
```

### State Management

- **Local State**: React hooks (`useState`, `useEffect`)
- **Form State**: Controlled components with validation
- **Authentication**: Service layer with localStorage
- **Error State**: Centralized error handling

### Component Patterns

- **Functional Components**: Using React hooks
- **Controlled Components**: Form inputs with state management
- **Conditional Rendering**: Dynamic UI based on state
- **Event Handling**: Proper event delegation and cleanup

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

- **Component Tests**: Testing UI components
- **Service Tests**: Testing API calls
- **Utility Tests**: Testing helper functions

## Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## Troubleshooting

### Common Issues

**1. Port Already in Use**
```bash
# Kill process on port 3000
npx kill-port 3000
# or
lsof -ti:3000 | xargs kill -9
```

**2. Module Resolution Issues**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**3. Build Failures**
```bash
# Check for syntax errors
npm run build
# Check for TypeScript errors
npx tsc --noEmit
```

**4. API Connection Issues**
- Verify backend server is running on `http://127.0.0.1:3080`
- Check CORS configuration on backend
- Verify network connectivity

### Performance Optimization

- **Code Splitting**: Lazy load components
- **Bundle Analysis**: `npm run build` and analyze bundle
- **Image Optimization**: Use WebP format for images
- **Caching**: Implement proper cache headers

## Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style

- Use functional components with hooks
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:

- **Issues**: Create an issue in the repository
- **Documentation**: Check this README and inline code comments
- **Community**: Join our development community

---

**Built with ❤️ using React**

*Happy coding! 🚀*