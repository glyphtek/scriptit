# Security Policy

## Supported Versions

We actively support the following versions of ScriptIt with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.7.x   | ✅ Yes             |
| 0.6.x   | ✅ Yes             |
| 0.5.x   | ⚠️ Critical fixes only |
| < 0.5   | ❌ No              |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities to us through one of the following methods:

### Email

Send an email to: **security@glyphtek.com**

Include the following information:
- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### GitHub Security Advisories

You can also report vulnerabilities through [GitHub Security Advisories](https://github.com/glyphtek/scriptit/security/advisories/new).

## Response Timeline

We aim to respond to security reports according to the following timeline:

- **Initial Response**: Within 48 hours
- **Triage**: Within 1 week
- **Fix Development**: Depends on severity
  - Critical: Within 1 week
  - High: Within 2 weeks
  - Medium: Within 1 month
  - Low: Next regular release
- **Public Disclosure**: After fix is released

## Security Measures

### Current Security Features

- **Input Validation**: All user inputs are validated and sanitized
- **Path Traversal Protection**: File paths are validated to prevent directory traversal
- **Environment Variable Security**: Sensitive variables are masked in logs
- **Process Isolation**: Scripts run in isolated processes
- **Secure Defaults**: All configurations use secure defaults

### Security Best Practices

When using ScriptIt:

1. **Keep Updated**: Always use the latest version
2. **Validate Scripts**: Review scripts before execution
3. **Limit Permissions**: Run with minimal required permissions
4. **Secure Environment**: Protect environment variables and configuration files
5. **Monitor Logs**: Review execution logs for suspicious activity

## Vulnerability Disclosure Policy

### Our Commitment

- We will respond to your report promptly and work with you to understand and resolve the issue
- We will keep you informed of our progress throughout the process
- We will credit you in our security advisory (unless you prefer to remain anonymous)
- We will not take legal action against you if you follow responsible disclosure practices

### Responsible Disclosure Guidelines

To qualify for responsible disclosure:

- Give us reasonable time to investigate and fix the issue before public disclosure
- Do not access, modify, or delete data that doesn't belong to you
- Do not perform actions that could harm our users or degrade our services
- Do not publicly disclose the vulnerability until we have released a fix
- Act in good faith and avoid violating privacy, destroying data, or interrupting services

### What We Ask

- Provide detailed information about the vulnerability
- Allow us reasonable time to address the issue
- Avoid automated scanning that might impact service availability
- Do not exploit the vulnerability beyond what is necessary to demonstrate it

## Security Hall of Fame

We recognize security researchers who help keep ScriptIt secure:

<!-- Security researchers will be listed here -->

*No security issues have been reported yet.*

## Security Updates

Security updates are released as patch versions and announced through:

- [GitHub Releases](https://github.com/glyphtek/scriptit/releases)
- [Security Advisories](https://github.com/glyphtek/scriptit/security/advisories)
- [NPM Package Updates](https://www.npmjs.com/package/@glyphtek/scriptit)

## Contact

For security-related questions or concerns:

- **Security Email**: security@glyphtek.com
- **General Contact**: hello@glyphtek.com
- **GitHub Issues**: For non-security bugs only

## Legal

This security policy is subject to our [Terms of Service](https://glyphtek.com/terms) and [Privacy Policy](https://glyphtek.com/privacy).

---

Thank you for helping keep ScriptIt and our users safe! 🔒 