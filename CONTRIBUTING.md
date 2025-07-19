# Contributing to Nexus Mint

Thank you for your interest in contributing to Nexus Mint! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch
4. **Make** your changes
5. **Test** your changes
6. **Submit** a pull request

## 📋 Prerequisites

Before contributing, ensure you have:

- **Node.js 18.20.4** (use `.nvmrc` file)
- **PNPM 8.15.0** (recommended package manager)
- **Git** (latest version)
- **Code editor** with ESLint and Prettier support

## 🔧 Development Setup

### 1. Environment Setup

```bash
# Install Node.js 18.x
nvm install 18.20.4
nvm use 18.20.4

# Install PNPM
npm install -g pnpm@8.15.0

# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/Nexus-Mint.git
cd Nexus-Mint

# Install dependencies
pnpm install

# Set up pre-commit hooks (optional)
pnpm run prepare
```

### 2. Environment Configuration

```bash
# Copy environment file
cp .env.example .env.local

# Edit with your local values
nano .env.local
```

## 🎯 Development Workflow

### 1. Create a Feature Branch

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/your-bug-description
```

### 2. Make Your Changes

- Write clean, readable code
- Follow TypeScript best practices
- Add appropriate comments
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type checking
pnpm typecheck

# Format code
pnpm format

# Check formatting
pnpm format:check
```

### 4. Commit Your Changes

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Examples of good commit messages
git commit -m "feat: add user authentication system"
git commit -m "fix: resolve navigation menu alignment issue"
git commit -m "docs: update API documentation"
git commit -m "test: add unit tests for user service"
git commit -m "refactor: simplify authentication logic"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 5. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create pull request on GitHub
```

## 📝 Pull Request Guidelines

### Before Submitting

1. **Ensure all tests pass**
   ```bash
   pnpm test
   pnpm lint
   pnpm typecheck
   pnpm format:check
   ```

2. **Update documentation** if your changes affect:
   - API endpoints
   - Configuration options
   - User-facing features

3. **Add tests** for new functionality

4. **Check bundle size** for significant changes
   ```bash
   pnpm analyze:bundle
   ```

### Pull Request Template

Use the following template when creating a PR:

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows the style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No console errors or warnings

## Screenshots (if applicable)
Add screenshots for UI changes

## Additional Notes
Any additional information
```

## 🧪 Testing Guidelines

### Unit Tests

- Write tests for all new functionality
- Maintain minimum 80% code coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

```typescript
// Example test structure
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      // Arrange
      const userData = { name: 'John Doe', email: 'john@example.com' };
      
      // Act
      const result = await userService.createUser(userData);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(userData.name);
    });
  });
});
```

### Integration Tests

- Test API endpoints
- Test database interactions
- Test external service integrations

### End-to-End Tests

- Test critical user journeys
- Use Playwright for browser automation
- Focus on user experience

## 📚 Code Style Guidelines

### TypeScript

- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use proper type annotations
- Avoid `any` type

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

// Avoid
const user: any = { id: '1', name: 'John' };
```

### React Components

- Use functional components with hooks
- Follow naming conventions (PascalCase for components)
- Use proper prop types
- Implement error boundaries

```typescript
// Good
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
};
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow BEM methodology for custom CSS
- Maintain consistent spacing and colors
- Ensure responsive design

## 🔍 Code Review Process

### Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and pass
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met

### Review Comments

- Be constructive and respectful
- Provide specific feedback
- Suggest improvements
- Ask questions when unclear

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce**
3. **Expected vs actual behavior**
4. **Environment details** (browser, OS, etc.)
5. **Screenshots or videos** if applicable
6. **Console errors** if any

## 💡 Feature Requests

When suggesting features:

1. **Clear description** of the feature
2. **Use case** and benefits
3. **Implementation suggestions** if possible
4. **Mockups or wireframes** if applicable

## 📖 Documentation

### Code Documentation

- Use JSDoc for functions and classes
- Include parameter types and descriptions
- Provide usage examples

```typescript
/**
 * Creates a new user in the system
 * @param userData - User information
 * @param options - Creation options
 * @returns Promise resolving to created user
 */
async function createUser(
  userData: CreateUserData,
  options?: CreateUserOptions
): Promise<User> {
  // Implementation
}
```

### README Updates

- Update README.md for significant changes
- Add new sections for new features
- Update installation instructions if needed

## 🔒 Security

### Security Guidelines

- Never commit sensitive information (API keys, passwords)
- Use environment variables for configuration
- Validate all user inputs
- Follow OWASP security guidelines
- Report security issues privately

### Reporting Security Issues

For security vulnerabilities, please:

1. **Do not** create a public issue
2. **Email** security@nexus-mint.com
3. **Include** detailed description and steps to reproduce
4. **Wait** for acknowledgment before public disclosure

## 🏆 Recognition

Contributors will be recognized in:

- Project README.md
- Release notes
- Contributor hall of fame
- GitHub contributors page

## 📞 Getting Help

If you need help:

1. **Check** existing issues and discussions
2. **Search** documentation
3. **Ask** in GitHub Discussions
4. **Create** an issue for bugs
5. **Email** support@nexus-mint.com

## 📄 License

By contributing to Nexus Mint, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Nexus Mint! 🚀