# Bug Bounty Program

> Last Updated: {{LAST_UPDATED}}

## Introduction

At {{SITE_NAME}}, we collaborate with security researchers to create a safer internet environment. If you have found a security vulnerability in our service, please contact us immediately.

This program is currently a **Vulnerability Disclosure Channel** focused on responsible reporting and collaboration rather than monetary rewards. We value and transparently cooperate with researchers who ethically disclose vulnerabilities.

## Scope (In-Scope)

Researchers may only test the following domains and services:

- {{SITE_NAME}} official website and its subdomains
- {{SITE_NAME}} official mobile applications (when available)
- API endpoints directly operated by {{SITE_NAME}}

Domains, third-party services (payment gateways, analytics tools, hosting providers, etc.) not listed above are not covered by this program. If you are unsure whether a target is in scope, please contact us before testing.

## Reward Policy

Currently, the {{SITE_NAME}} Bug Bounty Program does not offer regular monetary rewards. However, to show our appreciation for significant contributions, we operate the following:

- **Hall of Fame**: Listing the names of researchers who reported valid vulnerabilities (when operational).
- **Public Acknowledgment**: Providing public acknowledgment or a letter of recommendation with the researcher's consent.
- **Future Priority**: Providing priority participation opportunities if we transition to a paid program in the future.

We may introduce a monetary bounty system in the future depending on budget and service scale, and we will announce it on this page if implemented.

## Severity Criteria

| Severity | CVSS | Examples |
|---|---|---|
| Critical | 9.0-10.0 | Remote code execution, full DB leak, mass account takeover |
| High | 7.0-8.9 | SQL Injection, stored XSS, authentication bypass |
| Medium | 4.0-6.9 | Reflected XSS, sensitive action CSRF, information disclosure |
| Low | 0.1-3.9 | Missing security headers, version disclosure |

Severity may be adjusted based on actual impact.

## Reporting Vulnerabilities

### Reporting Channels

- **Email**: [{{EMAIL}}](mailto:{{EMAIL}})
- **Subject**: `[Security Report] Vulnerability Summary`
- **Language**: Please write in Korean or English.

### Reporting Format

To help us analyze and reproduce the issue, please include the following:

1. Vulnerability type and detailed description.
2. Specific steps to reproduce the issue (including scripts or command lines).
3. Affected URLs, API endpoints, or components.
4. Proof of Concept (PoC) code or screenshots.

### Report Quality Standards

- Reports that cannot be reproduced or lack sufficient detail may not be accepted.
- Automated scanner output reports are not accepted.
- **Duplicates**: Duplicate vulnerabilities are only credited to the first reporter. (Based on email server receipt timestamp)

### Process

1. **Receipt Confirmation**: We will send a confirmation email within 72 hours of your report.
2. **Analysis & Planning**: Once the vulnerability is verified, we will assess its severity and inform you of the estimated fix timeline. If we cannot meet the deadline, we will explain the reason and provide an updated schedule.
3. **Resolution & Notification**: We will notify you once the patch is complete. Resolution may take time if structural changes are required for service stability.
4. **Disclosure & Recognition**: Once resolved, we will decide on disclosure in consultation with the researcher. Valid reports will be recognized according to the 'Reward Policy' above.
5. **CVE Issuance**: For significant vulnerabilities, we may request CVE number issuance with the reporter's consent.

### Public Disclosure Policy

- We recommend disclosure after the patch is complete and request that you share the disclosure details with us in advance.
- If appropriate action is not taken within **60 days** of the report, the reporter has the right to disclose vulnerability details in a mutually agreed manner. (However, we may request a schedule adjustment for complex issues.)
- In urgent cases where active exploitation is observed in the wild, we may coordinate with you for an earlier disclosure.

## Testing Policy & Guidelines

Please adhere to the following guidelines for safe vulnerability testing.

### Allowed Activities

- Testing vulnerabilities using accounts you own or test accounts you created.
- **Minimal Verification**: Access only the minimum data necessary to prove the vulnerability. If you accidentally access others' sensitive information, stop immediately and include only masked information in your report.

### Test Environment

- **Test Account Request**: If you need a test account, you can request one at [{{EMAIL}}](mailto:{{EMAIL}}).
- **Automated Scans**: Light scanning is allowed, but high-load scans that generate excessive requests per second or affect service quality require prior coordination.

### Prohibited Activities (Out of Scope)

The following activities are strictly prohibited and may not be legally protected if violated:

- Running **excessive automated scans** (at a level that causes service load) without prior coordination.
- Any activity intentionally exhausting server resources (CPU, memory, disk, network bandwidth).
- Accessing or modifying other users' accounts, data, or personal information.
- Social engineering (phishing, etc.) or physical security attacks.

### Out-of-Scope

- Vulnerabilities found in third-party services or infrastructure.
- Physical security, HR systems, internal networks.
- Already public vulnerabilities or duplicate reports.
- Issues caused solely by sending spam or phishing emails.

### Low-Risk Vulnerabilities (Not Accepted)

The following are excluded from the program as they pose low security risk or are intended behavior:

- Low-impact CSRF such as logout CSRF
- Clickjacking on pages without sensitive information
- Simple version disclosure (banner grabbing)
- Missing security settings without proven exploitation path (e.g., missing security headers without direct impact, email sending policies, etc.)
- Browser autocomplete enabled

However, even the above items may be evaluated if they are chained with other vulnerabilities to prove an actual attack scenario.

### Researcher Protection (Safe Harbor)

If you research and report vulnerabilities in good faith and in compliance with this policy, we promise the following **to the extent permitted by applicable law**:

1. We consider your research activities as authorized security research and will not take any civil or criminal legal action against you.
2. We will not voluntarily report you to law enforcement or file a complaint.
3. If a third party initiates legal action regarding your research activities, we will provide support within a reasonable range, such as providing documentation proving you are a compliant researcher.

However, Safe Harbor does not apply in the following cases:

- Clearly violating the prohibited activities in this document.
- Unauthorized testing of third-party systems or infrastructure outside our control.

## Contact

If you have any questions about our Bug Bounty Program, please feel free to contact us at [{{EMAIL}}](mailto:{{EMAIL}}).
