```markdown
# recall Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns used in the `recall` TypeScript codebase. You'll learn about file naming conventions, import/export styles, commit message practices, and how to write and run tests. The repository does not use a specific framework, focusing on idiomatic TypeScript and custom workflows.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `userProfile.ts`, `dataFetcher.ts`

### Import Style
- Use **relative imports** for modules within the project.
  - Example:
    ```typescript
    import { fetchData } from './dataFetcher';
    ```

### Export Style
- Use **named exports** for functions, types, and constants.
  - Example:
    ```typescript
    // dataFetcher.ts
    export function fetchData() { ... }
    export const API_URL = '...';
    ```

### Commit Patterns
- Commit messages are **freeform** (no enforced prefixes).
- Average commit message length: ~63 characters.
- Example:
  ```
  Add support for user session persistence in local storage
  ```

## Workflows

### Development Workflow
**Trigger:** When adding or updating features or bug fixes  
**Command:** `/dev`

1. Create or update TypeScript files using camelCase naming.
2. Use relative imports to reference other modules.
3. Export functions and constants using named exports.
4. Write or update corresponding test files (`*.test.ts`).
5. Commit changes with a clear, descriptive message.

### Testing Workflow
**Trigger:** When verifying code correctness  
**Command:** `/test`

1. Identify or create test files matching the pattern `*.test.*`.
2. Write tests for new or updated functionality.
3. Run the test suite using the project's test runner (framework unknown; check project scripts or documentation).
4. Review test results and fix any failing tests.

## Testing Patterns

- Test files are named with the pattern `*.test.*` (e.g., `userProfile.test.ts`).
- The specific testing framework is **unknown**; check for scripts or dependencies in `package.json`.
- Place tests alongside implementation files or in a dedicated test directory.

**Example test file:**
```typescript
// userProfile.test.ts
import { getUserProfile } from './userProfile';

describe('getUserProfile', () => {
  it('returns the correct user data', () => {
    // test implementation
  });
});
```

## Commands
| Command   | Purpose                                  |
|-----------|------------------------------------------|
| /dev      | Start the development workflow           |
| /test     | Run tests and verify code correctness    |
```
