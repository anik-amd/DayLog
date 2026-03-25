# Contributing to DayLog

Thank you for your interest in contributing to DayLog! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Pull Request Process](#pull-request-process)
- [Questions](#questions)

---

## Code of Conduct

By participating in this project, you are expected to uphold our code of conduct. Please be respectful and constructive.

---

## Ways to Contribute

There are many ways to contribute:

1. **Report Bugs** - Create an issue with detailed reproduction steps
2. **Suggest Features** - Open an issue with your feature idea
3. **Code Contributions** - Fix bugs, add features, improve documentation
4. **Documentation** - Improve guides, README, or code comments
5. **Testing** - Help test and verify new features

---

## Getting Started

### Prerequisites

- Node.js (LTS)
- npm or yarn
- Git
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/DayLog.git
   cd DayLog
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npx expo start
   ```

### Running Tests

```bash
npm test
```

### Running Tests with Coverage

```bash
npm run test:coverage
```

---

## Development Workflow

### For Human Contributors

1. Create a branch from `dev`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our coding standards

3. Test your changes:
   - Run `npm test` to ensure tests pass
   - Test manually on your device/emulator

4. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   ```

5. Push and create a Pull Request against `dev`

### For AI Agents

AI agents contributing to this project must follow the guidelines in [AGENTS.md](AGENTS.md). Key points:

- Read `/docs/SPEC.md` and `/docs/TECHNICAL_ARCHITECTURE.md` before coding
- Follow the coding standards below
- Work step-by-step, one feature at a time
- Run type checking before completing work
- Do NOT commit unless explicitly requested by the user

---

## Coding Standards

### Language & Style

- Use **TypeScript** for all code
- Use **functional components** only (no class components)
- Use **hooks** for logic reuse

### Code Structure

- Keep files under **250 lines** when possible
- Separate business logic from UI components
- Use clear, descriptive variable and function names

### UI Development

- Use **NativeWind** (Tailwind CSS) for styling
- Do NOT use Material UI, Chakra UI, or similar heavy libraries
- Keep UI minimal and distraction-free

### Testing

- Write tests for bugs before fixing them
- Write tests for core features (database, auto-save, media)
- Do NOT write tests for UI, styling, or layout

### What NOT to Do

- Do NOT add unnecessary features
- Do NOT add analytics or tracking
- Do NOT add user accounts or cloud sync (except Google Drive backup)
- Do NOT introduce heavy dependencies

---

## Pull Request Process

### Before Submitting

1. Ensure all tests pass: `npm test`
2. Ensure type checking passes: (run via Expo)
3. Test your changes manually
4. Update documentation if needed

### PR Description

Include in your PR:

1. **Summary** - What does this PR do?
2. **Type** - Bug fix, feature, documentation, etc.
3. **Testing** - How did you test your changes?
4. **Screenshots** - If UI changes, add screenshots

### Review Process

1. Maintainers will review your PR
2. Address any feedback
3. Once approved, your changes will be merged

---

## Questions

- **Found a bug?** Open an issue with details
- **Have a question?** Start a discussion
- **Want to discuss?** Open an issue to propose

---

## Resources

- [README.md](README.md) - Project overview
- [AGENTS.md](AGENTS.md) - Development guidelines for AI agents
- [docs/SPEC.md](docs/SPEC.md) - Philosophy and features
- [docs/TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md) - Technical details

---

Thank you for contributing to DayLog!