# 42_MATCHA

## About

Matcha is a full-stack dating app focused on real connections and user privacy. It features smart matching algorithms, real-time chat, and a clean UI/UX. Built with scalability and modularity in mind, it's ideal for learning or extending modern app architecture.
Here is the link to the [subject](https://cdn.intra.42.fr/pdf/pdf/146222/en.subject.pdf)

## Team Members:

- [![okhiar's 42 stats](https://badge.mediaplus.ma/darkblue/okhiar)](https://github.com/oakoudad/badge42)

- [![obednaou's 42 stats](https://badge.mediaplus.ma/darkblue/obednaou)](https://github.com/oakoudad/badge42)

## Dating web app preview:

## Project Demo:

https://github.com/user-attachments/assets/e04d8ed8-2bc9-4e83-b2cf-7c550e0d307b

**Technologies**: TypeScript, ReactJS, Tailwind CSS, ExpressJS, Docker, PostgreSQL, pg-pool.

### Backend Engineering:
- Utilized literal queries instead of ORMs to deepen database understanding.
- Created custom validators and managed a connection pool while minimizing queries for efficient execution.

### Security Measures:
- Mitigated SQL injection, CSRF, and XSS vulnerabilities by using parameterized queries.
- Stored JWT tokens as HTTP-only cookies with an additional CSRF token for enhanced security.
- Strengthened password security with salts to defend against rainbow table attacks.

### Recommendation System:
- Built an engine to suggest profiles with advanced search capabilities.
- Filtering options include age, fame, interests, and gender.

### Frontend Engineering:
- Created fully responsive interfaces with ReactJS, minimizing backend requests and optimizing rendering.
- Designed the frontend using Figma and implemented it with Tailwind CSS.


### Cloudflare Tunnels
#### installation
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O ~/bin/cloudflared

# Give it permission to run
chmod +x ~/bin/cloudflared

```

#### create a temporary cloudflare tunnel
```bash
cloudflared tunnel --url <nginx-proxy-url>
```