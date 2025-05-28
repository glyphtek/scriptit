# Publishing Guide for ScriptIt

## Pre-Publication Checklist

### ✅ Code Quality
- [x] All tests pass: `bun test`
- [x] Code is properly formatted: `bun run format`
- [x] No linting errors: `bun run lint`
- [x] TypeScript compiles without errors: `bun run build`
- [x] CLI works correctly: `./bin/scriptit.sh --help`

### ✅ Documentation
- [x] README.md is comprehensive and up-to-date
- [x] CHANGELOG.md reflects current version changes
- [x] Examples are working and documented
- [x] API documentation is complete

### ✅ Package Configuration
- [x] package.json version is correct
- [x] package.json metadata is accurate (name, description, keywords)
- [x] Repository URLs point to correct GitHub repo
- [x] License file is present and correct
- [x] .npmignore excludes development files
- [x] `files` array in package.json includes only necessary files

### ✅ GitHub Repository
- [x] Repository is public and accessible
- [x] GitHub Actions CI is configured
- [x] Issue templates are set up
- [x] Contributing guidelines are present
- [x] License is properly configured on GitHub

### ✅ Testing
- [x] Package builds correctly: `npm pack --dry-run`
- [x] All dependencies are properly declared
- [x] Cross-runtime compatibility (Node.js, Bun)
- [x] CLI entry point works

## Publishing Steps

### 1. Final Version Check
```bash
# Update version if needed
npm version patch|minor|major

# Or manually update package.json version
```

### 2. Build and Test
```bash
# Clean build
bun run clean
bun run build

# Run all tests
bun test

# Test CLI
./bin/scriptit.sh --help
```

### 3. Verify Package Contents
```bash
# Check what will be published
npm pack --dry-run

# Verify package size and contents
```

### 4. Publish to NPM
```bash
# Login to npm (if not already logged in)
npm login

# Publish the package
npm publish --access public

# For scoped packages like @glyphtek/scriptit
```

### 5. Post-Publication
- [ ] Verify package is available: `npm view @glyphtek/scriptit`
- [ ] Test installation: `npm install -g @glyphtek/scriptit`
- [ ] Update GitHub release with changelog
- [ ] Announce on relevant platforms

## GitHub Release

After publishing to npm, create a GitHub release:

1. Go to GitHub repository
2. Click "Releases" → "Create a new release"
3. Tag version: `v0.3.0`
4. Release title: `ScriptIt v0.3.0`
5. Copy content from CHANGELOG.md for this version
6. Attach any relevant assets
7. Publish release

## Troubleshooting

### Common Issues

**Build Errors:**
- Ensure all TypeScript files compile
- Check import paths use `.js` extensions
- Verify all dependencies are installed

**Publishing Errors:**
- Check npm authentication: `npm whoami`
- Verify package name is available
- Ensure version number is incremented

**CLI Not Working:**
- Check shebang in bin/scriptit.sh: `#!/bin/bash`
- Verify file permissions: `chmod +x bin/scriptit.sh`
- Test with both Node.js and Bun

### Version Management

Follow semantic versioning:
- **Patch** (0.3.1): Bug fixes, small improvements
- **Minor** (0.4.0): New features, backward compatible
- **Major** (1.0.0): Breaking changes

## Organization Setup

For `@glyphtek` organization:
1. Ensure you have publish access to the organization
2. Organization must exist on npm
3. Package name must be available under the organization

## Security

- Never commit sensitive information
- Use `.npmignore` to exclude development files
- Regularly audit dependencies: `npm audit`
- Keep dependencies updated 