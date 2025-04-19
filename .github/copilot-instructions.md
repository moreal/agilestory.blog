# GitHub Copilot Instructions

This file provides custom instructions for GitHub Copilot when generating code
for this project.

## General Preferences

- **Code Style**: Follow the existing code style in the project. Use consistent
  indentation, naming conventions, and code organization.
- **Comments**: Include meaningful comments for complex logic, but avoid
  unnecessary comments for self-explanatory code.
- **Documentation**: Generate JSDoc/docstrings for functions and methods with
  parameters and return values clearly described.
- **Error Handling**: Always include appropriate error handling in generated
  code.
- **Testing**: When generating functions, consider including or suggesting test
  cases. Use '한국어' for naming specifications in tests. Do not use `spy` when
  writing test code.

## TypeScript & Deno Guidelines

### TypeScript

- Use strict mode with explicit types; avoid using `any` type
- Leverage TypeScript's advanced types (unions, intersections, utility types)
- Prefer interfaces for object shapes that will be extended/implemented
- Use type aliases for complex types or unions
- Utilize readonly properties and const assertions where appropriate
- Use discriminated unions for state management
- Prefer optional parameters over multiple function signatures
- Always include proper return types for functions, including Promise types

### Deno Specifics

- Use ES modules syntax (import/export) instead of CommonJS (require)
- Import with full URLs with version pinning for external dependencies
- Utilize Deno's standard library when appropriate
- Reference the correct permissions when using restricted APIs
- Use Deno.test() for unit testing with appropriate assertions
- Follow Deno's conventions for file names (snake_case)
- Use top-level await when appropriate
- Leverage Deno's built-in tooling (formatter, linter, etc.)
- Use Deno's native TypeScript support without transpilation steps

## Project-Specific Guidelines

- **Security**: Follow Deno's security-first approach; always consider
  appropriate permissions
- **Performance**: Consider optimization for performance-critical code,
  especially with async operations
- **TypeScript Configuration**: Respect the project's tsconfig settings and
  compiler options
- **Dependencies**: Use Deno standard library where possible before suggesting
  external dependencies
- **Code Patterns**: Follow established patterns already present in the project
- **Module Structure**: Organize code according to Deno's module system best
  practices

## What Not to Generate

- Do not generate code that performs destructive operations without confirmation
- Do not generate boilerplate tests that don't actually test functionality
- Do not generate complex algorithms without explanation
- Do not include placeholder comments like "TODO" without specific guidance
- Do not generate code that makes API calls to unknown or unauthorized services

## Special Instructions

- When asking for help with a specific component or function, prioritize
  Deno-compatible solutions
- When multiple approaches are possible, suggest the one that best leverages
  TypeScript's type system
- Consider runtime permissions and suggest appropriate Deno permission flags
- For API handlers, include proper validation, error handling, and TypeScript
  interfaces
- Ensure imported modules are version-pinned for stability (e.g.,
  `https://deno.land/std@0.204.0/http/server.ts`)
- When generating code that interacts with external systems, include appropriate
  error handling and response typing

## AI Pairing Guidelines

- When I ask "what's wrong with this code?", provide a comprehensive analysis of
  potential issues
- When I ask for a refactoring, maintain the same functionality while improving
  code quality
- When I ask for an alternative approach, explain the trade-offs between
  different solutions
- When I'm coding a new feature, help me consider edge cases and integration
  points

## Technical Debt Management

- Identify opportunities to leverage TypeScript's type system to prevent bugs
- Suggest improved error handling with union types or Result patterns
- Flag potential performance bottlenecks, especially with async operations
- Recommend Deno-specific patterns and standard library usage when applicable
- Suggest refactoring opportunities to improve type safety
- Help enforce consistent module organization according to Deno conventions

Remember that all generated code should prioritize correctness, readability, and
maintainability.
