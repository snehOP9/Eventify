# Production security checklist

Eventify currently documents development-oriented security defaults. Before exposing the application to real users, verify each item below.

- [ ] Configure strong, unique secrets through the deployment environment only.
- [ ] Disable development/demo authentication paths.
- [ ] Enable JWT authentication and enforce role checks for organizer and administrative operations.
- [ ] Restrict CORS to the deployed frontend origin instead of a wildcard or local origin.
- [ ] Configure HTTPS for the frontend, backend, OAuth callbacks, and payment provider webhooks.
- [ ] Keep Razorpay secret credentials server-side and verify payment/webhook signatures before changing registration state.
- [ ] Configure SMTP credentials outside source control and avoid logging OTPs or reset tokens in production.
- [ ] Use a managed PostgreSQL database with backups and least-privilege credentials.
- [ ] Review OAuth redirect URIs and remove unused callback URLs.
- [ ] Run backend validation, authentication, registration, cancellation, and payment tests before release.
- [ ] Confirm that production error responses do not expose stack traces, secrets, tokens, or database details.

This checklist is a release gate, not a claim that the current development configuration is production-ready.
