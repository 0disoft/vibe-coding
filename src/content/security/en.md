# Security Policy

> Last Updated: {{LAST_UPDATED}}


## Data Protection Technologies & Principles

User data is securely processed with protection measures applied at multiple layers, including encryption at rest and TLS in transit.

### Password Protection
**User passwords are never stored in plain text and are protected using the latest hashing technologies.**
- **Algorithm**: {{ENC_ALGO_PASSWORD}}
- **Reason**: {{ENC_REASON_PASSWORD}}
- A unique Salt is applied to each password to prevent rainbow table attacks.

### Data Encryption
**Sensitive information is encrypted immediately before storage, with strictly separated key management.**
- **Algorithm**: {{ENC_ALGO_DATA}}
- **Reason**: {{ENC_REASON_DATA}}
- **Key Derivation**: {{ENC_ALGO_KDF}} - {{ENC_REASON_KDF}}
- We use Envelope Encryption to protect Data Encryption Keys (DEK) with separate Key Encryption Keys (KEK).

### Data Integrity
**High-performance hash functions are used to verify that critical system data has not been tampered with.**
- **Algorithm**: {{ENC_ALGO_INTEGRITY}}
- **Reason**: {{ENC_REASON_INTEGRITY}}

### Transport Security
**All communication between users and servers is protected by an encrypted tunnel using the latest security protocols.**
- **Protocol**: {{ENC_ALGO_TRANSPORT}}
- **Reason**: {{ENC_REASON_TRANSPORT}}
- HTTPS is enforced for all communications, and HSTS is applied to strictly prevent downgrade attacks.

## Administrative & Physical Security

Beyond technical measures, we thoroughly manage security regarding people and processes.

- **Employee Access Control**: Data access is granted only to essential personnel based on the 'Principle of Least Privilege'. All access history is recorded and audited. Access without legitimate reason is strictly prohibited.
- **Physical Security**: All third-party cloud infrastructure operates in data centers that have obtained physical security certifications such as ISO 27001.

## Account & Session Security

- **Login Protection**: We apply login attempt limits and delay mechanisms to block automated brute-force attacks.
- **Session Management**: Sessions are automatically expired after a period of inactivity, and notifications are sent for important account changes.
- **Two-Factor Authentication**: We plan to introduce 2FA functionality in the future.

## Application Security

We design with security best practices such as OWASP Top 10 in mind from the development stage.

- **Input Validation**: Prepared Statements and ORMs are used for database queries, and user input is validated on both server and client sides.
- **Attack Defense**: CSRF tokens, SameSite cookie attributes, and CSP (Content Security Policy) are applied to mitigate session hijacking and script injection attacks.

## Software Supply Chain Security

- **Dependency Management**: External libraries and packages are only installed from official registries, and verified versions are ensured through lock files.
- **Vulnerability Checks**: Vulnerability reports are regularly reviewed, and high-risk dependencies are prioritized for updates.

## Data Retention & Deletion

- **Account Deletion**: Upon request for account deletion, related data is permanently destroyed after a 30-day grace period (for accidental deletion recovery).
- **Backup Data**: Backups for system stability are retained for a maximum of 90 days and then securely deleted. Due to technical limitations, complete deletion from backup systems may require additional time.
- **Log Data**: Access logs are retained for 1 year for long-term security threat analysis and trend identification.
- **Legal Retention Exception**: Data required by law to be retained for a specific period may be stored separately for the applicable duration.

## Incident Response

In the event of a security incident, we follow these procedures for rapid response and minimization of damage:

1. **Detection & Containment (Immediate)**: Isolate threats and prevent further damage.
2. **Impact Analysis**: Assess the scope and severity as quickly as possible, typically within hours.
3. **User Notification**: For incidents affecting users (e.g., data leaks), notify users as promptly as possible and comply with legal deadlines (e.g., 72 hours).
4. **Transparent Disclosure**: Publish a detailed report (cause, actions, preventive measures) after the incident is resolved.

## Security Audits & Third-Party Services

- **Security Audits**: We are currently in the service stabilization phase and conduct regular internal code reviews and security checks. We plan to introduce regular third-party security audits as the service scales.
- **Third-Party Infrastructure**: We adhere to the principle of not storing unencrypted sensitive information directly. For core functions like payments and authentication, we utilize trusted services ({{THIRD_PARTY_PROVIDERS}}, etc.) that have obtained internationally recognized security certifications (SOC 2, ISO 27001) or undergo equivalent security assessments regularly.

## Security Recommendations for Users

Account security is a shared responsibility.

- **Strong Passwords**: Use unique and complex passwords not used on other sites.
- **Beware of Phishing**: Be cautious of messages claiming to be official emails and check the address before clicking links.

## Contact

If you have any questions regarding our Security Policy, please contact us at [{{EMAIL}}](mailto:{{EMAIL}}).

For vulnerability reports and researcher protection policies, please refer to our [Bug Bounty Program](/bug-bounty) page.
