# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in EquiProfile, please report it responsibly:

1. **DO NOT** open a public GitHub issue
2. Email security concerns to: security@equiprofile.online
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to address the issue.

## Security Measures

### Authentication & Authorization

#### OAuth 2.0 Authentication
- Secure OAuth flows with supported providers (Google, GitHub, Microsoft)
- Session-based authentication with HTTP-only cookies
- CSRF protection on all state-changing operations
- No passwords stored locally

#### Role-Based Access Control (RBAC)
- Two roles: `user` and `admin`
- Admin routes protected by `adminProcedure` middleware
- Subscription-based access control for premium features
- Account suspension capability

### Data Protection

#### Encryption
- All data encrypted in transit (TLS 1.2+)
- Sensitive environment variables never committed to repository
- Database credentials stored in environment variables
- JWT secrets randomly generated and rotated regularly

#### Password Security
- No passwords stored (OAuth only)
- Session tokens automatically expire
- Secure cookie settings (httpOnly, secure, sameSite)

#### Data Validation
- All inputs validated using Zod schemas
- SQL injection prevention via Drizzle ORM parameterized queries
- XSS protection through React's built-in escaping
- File upload validation (type, size, extension)

### API Security

#### Rate Limiting
- Public endpoints: 100 requests per 15 minutes
- Authenticated endpoints: 1000 requests per 15 minutes
- File uploads: 50 requests per hour
- AI endpoints: 20 requests per hour

#### Input Validation
- All API inputs validated before processing
- File uploads limited to 20MB
- Supported file types whitelisted
- Base64 validation for file data

#### Error Handling
- Generic error messages to prevent information leakage
- Detailed errors logged server-side only
- No stack traces exposed in production
- Consistent error response format

### Infrastructure Security

#### Environment Variables
Required secure configuration:
```env
# Strong random string (32+ characters)
JWT_SECRET=

# Production database credentials
DATABASE_URL=

# API keys with restricted permissions
OPENAI_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Stripe webhook secret for signature verification
STRIPE_WEBHOOK_SECRET=
```

#### Database Security
- Encrypted connections to database
- Limited database user permissions
- Regular automated backups
- Point-in-time recovery enabled

#### File Storage (AWS S3)
- Private buckets with presigned URLs
- Files organized by user ID
- Automatic virus scanning (if configured)
- Regular access log reviews

### Application Security

#### Dependencies
- Regular dependency updates via Dependabot
- Security audits with `npm audit`
- No dependencies with known critical vulnerabilities
- Minimal dependency footprint

#### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Prettier for consistent formatting
- Unit and integration tests

#### Security Headers
Recommended Nginx configuration:
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;
```

### Monitoring & Logging

#### Activity Logging
- All user actions logged to database
- Admin actions tracked separately
- Failed authentication attempts logged
- Suspicious activity alerts

#### Error Monitoring
- Errors logged with context (user ID, path, timestamp)
- Production errors sent to monitoring service
- Real-time alerting for critical errors
- Regular log review and analysis

#### Backup & Recovery
- Daily automated backups
- 30-day backup retention
- Tested restore procedures
- Off-site backup storage

## Security Best Practices

### For Users
1. **Enable 2FA** on your OAuth provider account
2. **Review account activity** regularly in the dashboard
3. **Report suspicious activity** immediately
4. **Use secure devices** when accessing the platform
5. **Logout from shared devices** after use

### For Administrators
1. **Use the admin toggle** (`showAdmin()`) only when needed
2. **Keep admin password secure** and change regularly
3. **Monitor activity logs** for suspicious patterns
4. **Review user suspensions** and account deletions
5. **Audit system settings** changes regularly

### For Developers
1. **Never commit secrets** to the repository
2. **Use environment variables** for all sensitive data
3. **Validate all inputs** before processing
4. **Follow principle of least privilege**
5. **Keep dependencies updated**
6. **Review security advisories** regularly
7. **Use prepared statements** for all database queries
8. **Implement rate limiting** on all public endpoints

## Compliance

### GDPR Compliance
- User data deletion on request
- Data export capability
- Privacy policy and terms of service
- Cookie consent management
- Data processing agreements

### Data Retention
- Active user data: Retained while account is active
- Deleted user data: Permanently removed within 30 days
- Backup data: Retained for 30 days
- Activity logs: Retained for 90 days

## Security Checklist for Deployment

- [ ] All environment variables set and secured
- [ ] Database using encrypted connections
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Security headers configured in Nginx
- [ ] Rate limiting enabled
- [ ] Error monitoring configured
- [ ] Backup system tested and verified
- [ ] Admin password changed from default
- [ ] Dependencies updated to latest secure versions
- [ ] Firewall rules configured (ports 80, 443, 22 only)
- [ ] Fail2ban configured for SSH protection
- [ ] Regular security updates scheduled

## Vulnerability Disclosure Timeline

1. **Day 0**: Vulnerability reported
2. **Day 2**: Initial response and assessment
3. **Day 7**: Fix developed and tested
4. **Day 14**: Security patch deployed
5. **Day 30**: Public disclosure (if appropriate)

## Security Updates

Subscribe to security notifications:
- GitHub Security Advisories
- Email: security@equiprofile.online
- Status page: status.equiprofile.online

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [tRPC Security](https://trpc.io/docs/server/authorization)
- [React Security](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

## Contact

For security concerns:
- Email: security@equiprofile.online
- PGP Key: Available on request
- Response time: Within 48 hours

---

Last updated: December 2024
