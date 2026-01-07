# Contributing to EquiProfile

Thank you for your interest in contributing to EquiProfile! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

Before creating a bug report:
1. Check the [existing issues](https://github.com/amarktainetwork-blip/Equiprofile.online/issues)
2. Verify the bug in the latest version
3. Collect relevant information (browser, OS, steps to reproduce)

When reporting a bug, include:
- Clear, descriptive title
- Detailed steps to reproduce
- Expected vs. actual behavior
- Screenshots or error messages
- Environment details (OS, browser, Node version)

### Suggesting Features

Feature requests are welcome! Please:
1. Check if the feature has already been requested
2. Describe the problem it solves
3. Provide examples of how it would work
4. Consider how it fits with existing features

### Pull Requests

#### Before Starting
1. **Discuss major changes** in an issue first
2. **Fork the repository** and create a branch
3. **Follow the coding standards** outlined below

#### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Equiprofile.online.git
cd Equiprofile.online

# Install dependencies
pnpm install

# Create .env file (see .env.example)
cp .env.example .env

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

#### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Write clean, maintainable code**
   - Follow existing code style
   - Add comments for complex logic
   - Keep functions small and focused

3. **Write tests**
   ```bash
   # Run tests
   pnpm test

   # Run tests in watch mode
   pnpm test:watch
   ```

4. **Update documentation**
   - Update README.md if needed
   - Add JSDoc comments to new functions
   - Update API.md for API changes

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

#### Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(horses): add bulk import from CSV
fix(auth): resolve session timeout issue
docs(api): update authentication documentation
test(training): add tests for session completion
```

#### Submitting a Pull Request

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a pull request** on GitHub

3. **Fill out the PR template** with:
   - Description of changes
   - Related issue number
   - Testing steps
   - Screenshots (for UI changes)

4. **Wait for review**
   - Address reviewer feedback
   - Keep PR updated with main branch
   - Be patient and respectful

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` type - use proper types
- Use interfaces for object shapes
- Enable strict mode

### React

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Avoid inline styles

### Backend

- Use tRPC for API routes
- Validate all inputs with Zod
- Use proper error handling
- Add activity logging for important actions

### Database

- Use Drizzle ORM for database queries
- Create migrations for schema changes
- Never commit migration SQL manually
- Test migrations on development first

### Testing

- Write tests for new features
- Maintain test coverage above 70%
- Use descriptive test names
- Test edge cases and error scenarios

### Code Style

```typescript
// ✅ Good
export async function createHorse(input: CreateHorseInput): Promise<Horse> {
  const validated = validateHorse(input);
  const horse = await db.horses.create(validated);
  await logActivity('horse_created', horse.id);
  return horse;
}

// ❌ Bad
export async function createHorse(input: any) {
  return await db.horses.create(input);
}
```

### File Organization

```
client/src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
└── contexts/       # React contexts

server/
├── _core/          # Core server functionality
├── routers.ts      # API routes
├── db.ts           # Database queries
└── *.test.ts       # Tests
```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Review Process

1. Automated checks must pass:
   - TypeScript compilation
   - Tests
   - Linting
   - Build

2. Code review by maintainer:
   - Code quality
   - Test coverage
   - Documentation
   - Security implications

3. Approval and merge

## Project Structure

### Frontend (React + Vite)
- **Components**: Reusable UI components using shadcn/ui
- **Pages**: Route-level components
- **Hooks**: Custom React hooks
- **Contexts**: Global state management

### Backend (Express + tRPC)
- **Routers**: API route definitions
- **Database**: Drizzle ORM with MySQL
- **Auth**: OAuth 2.0 with session cookies
- **Storage**: AWS S3 for file uploads

### Key Technologies

- **TypeScript** - Type safety
- **React 19** - UI framework
- **tRPC** - Type-safe API
- **Drizzle ORM** - Database ORM
- **Tailwind CSS** - Styling
- **Vitest** - Testing
- **Zod** - Schema validation

## Testing Guidelines

### Unit Tests
- Test individual functions and components
- Mock external dependencies
- Focus on business logic

### Integration Tests
- Test API endpoints end-to-end
- Use test database
- Test authentication flows

### Best Practices
```typescript
// Good test structure
describe('horses router', () => {
  beforeEach(() => {
    // Setup
  });

  it('creates a new horse', async () => {
    // Arrange
    const input = { name: 'Thunder' };
    
    // Act
    const result = await caller.horses.create(input);
    
    // Assert
    expect(result).toHaveProperty('id');
  });
});
```

## Documentation

### Code Comments
- Use JSDoc for public APIs
- Explain "why" not "what"
- Keep comments up-to-date

### API Documentation
- Update API.md for endpoint changes
- Include request/response examples
- Document error cases

### README Updates
- Keep setup instructions current
- Update feature list
- Add troubleshooting tips

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Create an issue
- **Security**: Email security@equiprofile.online
- **Chat**: Join our Discord (link in README)

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in commit messages

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Thank You!

Your contributions make EquiProfile better for everyone in the equestrian community. We appreciate your time and effort! 🐴

---

For questions about contributing, contact: contribute@equiprofile.online
