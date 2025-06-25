# Project Code Style Guide

This document outlines the code style, formatting, and linting standards for this project. Adhering to these guidelines ensures consistency, readability, and maintainability of the codebase.

## Core Tools

Our code style is automated using two primary tools:
- **[Prettier](https://prettier.io/):** An opinionated code formatter that enforces a consistent style across the entire codebase.
- **[ESLint](https://eslint.org/):** A static analysis tool that identifies and reports on problematic patterns found in the code.

## Formatting Rules (Enforced by Prettier)

Our Prettier configuration (`.prettierrc`) enforces the following rules automatically. You do not need to worry about them as long as you have the pre-commit hook enabled.

- **Print Width:** `80` characters
- **Tab Width:** `2` spaces
- **Semicolons:** Required (`true`)
- **Quotes:** Single quotes (`'`) are used instead of double quotes (`"`).
- **Trailing Commas:** Used for multi-line ES5-valid data structures (e.g., objects, arrays).

## Linting Rules (Enforced by ESLint)

Our ESLint configuration (`.eslintrc.js`) helps us catch potential errors and maintain best practices. Key rules include:

- **Naming Conventions:**
  - Classes must be `PascalCase`.
  - Methods and variables must be `camelCase`.
  - **Private methods must have a leading underscore** (e.g., `_myPrivateMethod`).
- **TypeScript Best Practices:** We extend the `plugin:@typescript-eslint/recommended` ruleset.

## Automation

### Local Development

To make adherence to these standards seamless, we use a pre-commit hook managed by **Husky** and **lint-staged**.

Before any commit, the following actions will happen automatically:
1.  `prettier --write` is run on all staged `.ts` files to format them.
2.  `eslint --fix` is run on the formatted files to correct any auto-fixable linting errors.

If there are any linting errors that cannot be auto-fixed, the commit will be aborted, allowing you to fix them manually.

### Running Manually

You can run the formatter and linter manually at any time using the following npm scripts:

- **To format all files:**
  ```bash
  npm run format
  ```

- **To check for linting errors:**
  ```bash
  npm run lint
  ``` 