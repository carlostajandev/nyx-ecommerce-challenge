@AGENTS.md

# Commit conventions (enforced)

1. **Never add `Co-Authored-By: Claude` or any Anthropic/Claude attribution** in commit messages.
2. **Never add the "🤖 Generated with [Claude Code]" footer** or any AI-generated signature.
3. **Never add emoji in commit messages** unless explicitly requested by the user.
4. The commit author is always the configured git identity (`git config user.name`). Never override `--author`.
5. Format: `type(scope): description` — lowercase, imperative mood, English, no trailing period.

Valid types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`.
