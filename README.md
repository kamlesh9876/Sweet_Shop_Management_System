# Sweet Shop Management System

A full-stack web application for managing sweet shop inventory, orders, and user authentication with role-based access control.

## Screenshots

### Login Page
![Login Page](image.png)

### Admin Dashboard - Product Management
![Admin Dashboard](Screenshot%202025-12-14%20205450.png)

### Product Catalog View
![Product Catalog](Screenshot%202025-12-14%20210143.png)

### Order Management
![Order Management](Screenshot%202025-12-14%20210235.png)

## Frontend Development Guide

### React + TypeScript + Vite

This frontend uses a minimal setup to get React working in Vite with HMR and some ESLint rules.

#### Available Plugins
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

#### React Compiler
The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

#### ESLint Configuration
For production applications, consider updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

For React-specific lint rules, install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom).

## Image Integration Guide

### Where to Place Your Images

#### Product Images
Place your sweet product images in:
```
frontend/public/images/sweets/
```

#### Supported Formats
- JPG, JPEG, PNG, WebP
- Recommended size: 800x600px for product images
- Keep file sizes under 500KB for optimal performance

#### Image Naming Convention
- Use lowercase letters and hyphens
- Example: `chocolate-cake.jpg`, `vanilla-ice-cream.jpg`
- Match the filename to the sweet name for consistency

#### Current Setup
Your application will:
1. Show product images at the top of each sweet card
2. Display a placeholder if no image is available
3. Handle broken images gracefully with fallback

#### 4th Image Download Guide
For additional images from Storyset:

1. **Visit**: https://storyset.com/illustration/eating-healthy-food/rafiki
2. **Download Steps**:
   - Click on the illustration you like
   - Click the "Download" button
   - Choose PNG format (recommended)
   - Select color or customize if desired
   - Download the image
3. **Save Location**:
   - Save as: `eating-healthy-food-rafiki.png`
   - Place in: `frontend/public/images/sweets/`

The application is already configured to display this image at 256x192px with rounded corners, shadow, and hover effects.

## Architecture

### Backend (Node.js + TypeScript + Express)
- **Framework**: Express.js with TypeScript
- **Database**: SQLite with proper schema
- **Authentication**: JWT with bcrypt password hashing
- **Testing**: Vitest with Supertest for integration tests

### Frontend (React + TypeScript + Vite)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **HTTP Client**: Axios with interceptors
- **Testing**: Vitest + @testing-library/react

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Role-based access control (Admin/Employee)
- Protected routes and middleware

### Sweet Management
- CRUD operations for sweets
- Search and filter by name, category, price range
- Stock management (purchase/restock)
- Admin-only create/update/delete operations

### User Interface
- Modern responsive design
- Role-specific dashboards
- Real-time inventory updates
- Form validation and error handling

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Sweet_Shop_Management_System
```

2. **Install all dependencies**
```bash
npm run install:all
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start development servers**
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run backend-dev  # Backend on port 3001
npm run frontend-dev # Frontend on port 5173
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_PATH=./database.sqlite

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Security
SALT_ROUNDS=10

# CORS Configuration
FRONTEND_URL=http://localhost:5173
FRONTEND_URL_ALT=http://localhost:5174
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Sweets
- `GET /api/sweets` - Get all sweets
- `GET /api/sweets/search` - Search/filter sweets
- `POST /api/sweets` - Create sweet (Admin only)
- `PUT /api/sweets/:id` - Update sweet (Admin only)
- `DELETE /api/sweets/:id` - Delete sweet (Admin only)
- `POST /api/sweets/:id/purchase` - Purchase sweet
- `POST /api/sweets/:id/restock` - Restock sweet (Admin only)

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'customer',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Sweets Table
```sql
CREATE TABLE sweets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  total REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## Testing

### Backend Tests
```bash
cd backend
npm test              # Run tests once
npm run test:run      # Run tests without watch
npm run test:watch    # Run tests in watch mode
```

### Frontend Tests
```bash
cd frontend
npm test              # Run tests once
npm run test:run      # Run tests without watch
```

### Test Coverage
The test suite covers:
- Authentication endpoints (register/login)
- Sweet CRUD operations
- Search and filtering
- Purchase and restock functionality
- Role-based access control
- Input validation and error handling

## Project Structure

```
Sweet_Shop_Management_System/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── types/
│   ├── test/
│   ├── package.json
│   └── vitest.config.ts
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   └── test/
│   ├── package.json
│   └── vite.config.ts
├── .env.example
└── README.md
```

## My AI Usage

### AI Tools Used
- **GitHub Copilot**: Used for boilerplate code generation, test templates, and code suggestions
- **ChatGPT**: Used for debugging assistance, architectural decisions, and documentation generation
- **Gemini**: Used for API endpoint design, database schema planning, and code refactoring suggestions
- **Claude**: Used for comprehensive testing strategies, error handling patterns, and security best practices
- **Cursor AI**: Used for rapid prototyping, component generation, and UI/UX design implementations

### How AI Was Used
1. **Code Generation**: Initial project setup, component templates, and test scaffolding (Copilot, Cursor AI)
2. **Debugging**: Resolving TypeScript errors and dependency issues (ChatGPT, Claude)
3. **Documentation**: Generating README content and API documentation (ChatGPT, Gemini)
4. **Testing**: Creating test cases and test data setup (Claude, Copilot)
5. **Architecture**: Making design decisions for project structure and data flow (Gemini, ChatGPT)
6. **API Design**: Designing RESTful endpoints and database schemas (Gemini, Claude)
7. **UI/UX Implementation**: Rapid prototyping of components and layouts (Cursor AI, Copilot)
8. **Security Implementation**: Authentication patterns and security best practices (Claude, Gemini)

### Impact Assessment
AI significantly accelerated development by:
- Reducing boilerplate writing time by ~60%
- Helping identify and fix TypeScript issues quickly
- Providing consistent code patterns and best practices
- Generating comprehensive test coverage templates
- Accelerating API design and database schema creation
- Improving security implementation through expert guidance
- Enhancing UI/UX development with rapid prototyping
- Streamlining documentation and code organization

### Human Oversight
All AI-generated code was:
- Reviewed for correctness and security
- Modified to fit project requirements
- Tested thoroughly before integration
- Validated against business logic requirements

## AI Co-Authorship Policy

Any commit that used AI assistance includes the following co-author trailer:

```
Co-authored-by: GitHub Copilot copilot@users.noreply.github.com
```

Example commit message:
```
feat: implement authentication middleware
Co-authored-by: GitHub Copilot copilot@users.noreply.github.com
```

## Development Workflow

### TDD Approach
The project follows Test-Driven Development:

1. **Red**: Write failing tests for new features
2. **Green**: Implement minimal code to pass tests
3. **Refactor**: Improve code while maintaining test coverage

### Commit Strategy
- Descriptive commit messages following conventional commits
- AI co-authorship trailers when applicable
- Frequent, small commits for better tracking

### Code Quality
- TypeScript strict mode enabled
- ESLint configuration for code consistency
- Comprehensive error handling
- Input validation and sanitization

## Deployment

### Production Build
```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build
```

### Environment Setup
- Set `NODE_ENV=production`
- Use secure JWT_SECRET
- Configure proper CORS origins
- Set up production database

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Implement the feature
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions:
- Check the test suite for expected behavior
- Review API documentation
- Create an issue in the repository

---

**Note**: This project demonstrates modern full-stack development practices with comprehensive testing, documentation, and AI-assisted development workflows.
