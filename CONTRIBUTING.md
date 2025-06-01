<p align="center">
  <img alt="Closures+ Contribution Guidelines Banner" src="/docs/contribution-banner.svg" height="80">
</p>

# Contributing to Closures+

First off, thank you for considering contributing to Closures+! 🎉 We truly appreciate the community's help in making this script, and the entire Editor+ series, the best possible tools for Waze Map Editors.

This project adheres to open-source principles, and we welcome contributions of all kinds. Whether you're reporting a bug, suggesting a feature, writing code, improving documentation, or helping with translations, your input is valuable.

Please take a moment to review this document to understand how you can contribute effectively. We also expect all contributors to adhere to our [Code of Conduct](/CODE_OF_CONDUCT.md).

## Ways to Contribute

There are many ways to contribute to Closures+:

* **Reporting Bugs:** Found something not working as expected? Let us know!
* **Suggesting Enhancements:** Have an idea for a new feature or an improvement to an existing one?
* **Code Contributions:** Help build new features, fix bugs, or improve performance.
* **Localization & Translation:** Make Closures+ accessible to editors worldwide.
* **Documentation:** Improve the README, add usage examples, or create tutorials.
* **Testing:** Help test development versions and provide feedback.

## Reporting Bugs

If you encounter a bug, please search the [GitHub Issues](https://github.com/davidsl4/wme-closures-plus/issues) first to see if it has already been reported. If not, please [open a new issue](https://github.com/davidsl4/wme-closures-plus/issues/new/choose).

When reporting a bug, please include:

1.  A clear and descriptive title.
2.  Steps to reproduce the bug consistently.
3.  What you expected to happen.
4.  What actually happened (include screenshots or console errors if possible).
5.  Your environment (Browser, Operating System, Tampermonkey/Greasemonkey version, other potentially conflicting scripts).

## Suggesting Enhancements

We welcome ideas for new features! Please check the [GitHub Issues](https://github.com/davidsl4/wme-closures-plus/issues) (especially those tagged 'enhancement' or with type 'feature') to see if your idea has already been suggested.

If not, feel free to [open a new issue](https://github.com/davidsl4/wme-closures-plus/issues/new/choose), clearly outlining the proposed feature and its benefits.

## Localization and Translation

We aim to make Closures+ usable for editors in any language. To make it happen we're using a localization management platform which streamlines the translation and localization process and enables us to surface these translations in no-time! The platform we're using is named Crowdin and it provides simple user interface for users to translate everything.

If you're fluent in another language, your help translating the interface would be greatly appreciated! You can start by following [this link](https://translate.editorx.dev) to the localization platform (https://translate.editorx.dev).

### Localization Process

The project uses GitHub Actions to automatically upload localization files to Crowdin when changes are detected. The source files are located in `src/localization/static/userscript.json` and are automatically uploaded to Crowdin when changes are pushed to the repository.

For more information about the Crowdin integration and how it works, see the [Crowdin Integration](/docs/crowdin-integration.md) documentation.

## Code Contributions

We love code contributions! If you'd like to contribute code, please follow these guidelines:

### Development Setup

1.  **Fork & Clone:** Fork the repository to your GitHub account and clone it locally.
2.  **Branch:** Create a new branch for your feature or fix:
    * `git checkout -b feat/your-feature-name`
    * `git checkout -b fix/short-bug-description`
3.  **Dependencies:** Make sure you have installed the npm package manager in order to install the mandatory dependencies using `npm install`.
4.  **Code:** Write your code, adhering to the style guidelines below.
5.  **Format & Lint:** Ensure your code adheres to the project's style by running:
    * `npm run lint` *(Runs ESLint + Prettier)*
6.  **Commit:** Commit your changes using the Conventional Commit format (see below).
7.  **Push:** Push your branch to your fork.
8.  **Pull Request:** Open a Pull Request (PR) against the `main` branch of the original repository.

### Code Style and Linting

* We use [**Prettier**](https://prettier.io/) for automatic code formatting. Please run it before committing. Configuration is in `.prettierrc`.
* We use [**ESLint**](https://eslint.org/) for identifying potential code errors and enforcing style. Please ensure `npm run lint` passes without errors. Configuration is in `.eslintrc`.

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This helps automate changelogs and makes commit history easier to understand. Each commit message should consist of:

1.  **Type:** A tag indicating the kind of change:
    * `feat`: A new feature.
    * `fix`: A bug fix.
    * `docs`: Documentation only changes.
    * `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
    * `refactor`: A code change that neither fixes a bug nor adds a feature.
    * `perf`: A code change that improves performance.
    * `test`: Adding missing tests or correcting existing tests.
    * `build`: Changes that affect the build system or external dependencies.
    * `ci`: Changes to our CI configuration files and scripts.
    * `chore`: Other changes that don't modify src or test files (e.g., updating dependencies).
2.  **Scope (Optional):** A noun describing the section of the codebase affected (e.g., `feat(closures-panel): ...`).
3.  **Description:** A short, imperative mood summary of the change (e.g., `Add template saving functionality`).
4.  **Body (Optional):** A more detailed explanation, motivation, and context for the change, separated by a blank line from the description.
5.  **Footer (Optional):** Reference issues (`closes #123`), breaking changes (`BREAKING CHANGE: ...`), etc.

**For Fixes:** Please include the issue number (if applicable), a brief description of the *reason* for the bug, and the *fix* applied in the commit body or PR description.

**Example:**

```
feat: Add support for recurring closures

Allows users to define daily, weekly, or monthly recurrence patterns
for closures via the updated closures panel interface.

closes #42
```

```
fix: Prevent overlapping closures on save

Previously, the validation logic only ran client-side and could be bypassed.
This adds server-side (or equivalent persistent) validation before saving.

fixes #55
```


### Pull Request Process

1.  Ensure your PR addresses a single feature or bug fix. Do not mix unrelated changes.
2.  Ensure all code style and linting checks pass.
3.  Ensure any associated Continuous Integration (CI) pipelines succeed.
4.  Your PR will first be reviewed automatically by **CodeRabbit AI** for common issues. Please address its feedback.
5.  A human reviewer (likely @davidsl4) will then review the code for logic, functionality, and adherence to project goals.
6.  We prefer a **linear Git history**. Please be prepared to rebase your branch onto the target branch before merging, if requested, to resolve conflicts or simplify history. Squash commits if necessary to keep the history clean and focused.

## License

By contributing to Closures+, you agree that your contributions will be licensed under its [Apache License 2.0](/LICENSE).
