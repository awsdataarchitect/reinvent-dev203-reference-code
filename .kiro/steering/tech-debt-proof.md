---
inclusion: always
---
<!------------------------------------------------------------------------------------
   Add rules to this file or a short description that will apply across all your workspaces.
   
   Learn about inclusion modes: https://kiro.dev/docs/steering/#inclusion-modes
-------------------------------------------------------------------------------------> 

# MUST USE THESE RULES

## Code Security
- Never hardcode secrets, API keys, or passwords
- Use environment variables for configuration
- Validate all user inputs
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization

## Dependency Management
- Use latest stable versions of all libraries and dependencies e.g AWS CDK for infrastructure, AWS CLI for command line
- Leverage Context7 MCP server to verify compatibility before adding dependencies
- Keep dependencies updated
- Use dependency scanning tools
- Review third-party packages before adding
- Use lock files (package-lock.json, poetry.lock)
- Remove unused dependencies

## Infrastructure Security
- Use least privilege principle for IAM
- Enable logging and monitoring

## Development Practices
- Maintain clean directory structures
- Never create duplicate files with suffixes like `_fixed`, `_clean`, `_backup`, etc.
- Work iteratively on existing files (hooks handle commits automatically)
- Use consistent naming conventions across the project
- Avoid temporary or backup files in version control

## Documentation Approach
- Maintain single comprehensive README covering all aspects including deployment
- Reference official sources through MCP servers and tools when available
- Update documentation when upgrading dependencies
- Keep documentation close to relevant code
