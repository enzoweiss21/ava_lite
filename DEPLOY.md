# Deployment Guide for Ava Mirror

## Vercel (Recommended - 2 minutes)

### Prerequisites
- GitHub account
- Vercel account (free tier works great)
- Node.js 20+ locally for testing

### Steps

#### 1. Initialize Git & Push to GitHub
```bash
cd ava-mirror

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial Ava Mirror implementation"

# Create repo on GitHub, then:
git remote add origin https://github.com/yourusername/ava-mirror.git
git branch -M main
git push -u origin main
```

#### 2. Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your `ava-mirror` repo
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add Environment Variables (optional):
   - `OPENAI_API_KEY`: `sk-proj-...`
   - `NEXT_PUBLIC_DEMO_MODE`: `true`
6. Click "Deploy"

**Option B: Via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# For production
vercel --prod
```

#### 3. Add Environment Variables (Optional)

In Vercel Dashboard:
1. Go to your project
2. Settings → Environment Variables
3. Add:
   - `OPENAI_API_KEY` (optional - for real LLM responses)
   - `NEXT_PUBLIC_DEMO_MODE` = `true`

4. Redeploy:
```bash
vercel --prod
```

### Your live URL:
`https://ava-mirror-yourusername.vercel.app`

---

## Netlify (Alternative)

### Steps

1. Build your app locally:
```bash
npm run build
```

2. Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

3. Deploy:
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

4. Add environment variables in Netlify Dashboard

---

## Railway (Backend Focus)

### Steps

1. Create `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

2. Deploy:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

---

## Self-Hosted (VPS)

### Requirements
- Ubuntu 20.04+ or similar
- Node.js 20+
- PM2 for process management
- Nginx for reverse proxy

### Steps

#### 1. Setup Server
```bash
# SSH into your server
ssh user@your-server-ip

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt update
sudo apt install nginx
```

#### 2. Deploy App
```bash
# Clone your repo
git clone https://github.com/yourusername/ava-mirror.git
cd ava-mirror

# Install dependencies
npm install

# Build
npm run build

# Create .env.local
nano .env.local
# Add your environment variables

# Start with PM2
pm2 start npm --name "ava-mirror" -- start
pm2 save
pm2 startup
```

#### 3. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/ava-mirror
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/ava-mirror /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Docker (For Containerization)

### Create `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
```

### Create `.dockerignore`:
```
node_modules
.next
.env.local
.git
README.md
```

### Build & Run:
```bash
# Build image
docker build -t ava-mirror .

# Run container
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=sk-proj-... \
  -e NEXT_PUBLIC_DEMO_MODE=true \
  ava-mirror
```

### Docker Compose:
```yaml
version: '3.8'

services:
  ava-mirror:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NEXT_PUBLIC_DEMO_MODE=true
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | No | None | OpenAI API key for real LLM responses |
| `NEXT_PUBLIC_DEMO_MODE` | No | `true` | Enable demo mode |

---

## Post-Deployment Checklist

- [ ] App loads at deployed URL
- [ ] Tasks appear in the feed (updates every 3s)
- [ ] "Why?" button opens reasoning panel
- [ ] Explanation text generates successfully
- [ ] Follow-up questions work
- [ ] Animations are smooth
- [ ] Mobile view looks good
- [ ] No console errors
- [ ] API routes respond correctly
- [ ] Environment variables are set (if using OpenAI)

---

## Monitoring & Analytics (Optional)

### Add Vercel Analytics
```bash
npm install @vercel/analytics
```

In `src/app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Add Sentry for Error Tracking
```bash
npm install @sentry/nextjs
```

Follow [Sentry Next.js setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

---

## Performance Tips

1. **Enable caching** for API routes (SWR already handles client-side)
2. **Use CDN** for static assets (Vercel does this automatically)
3. **Optimize images** if you add custom graphics
4. **Enable compression** in Nginx (for self-hosted)
5. **Monitor bundle size**: `npm run build` shows sizes

---

## Troubleshooting

### Build fails on Vercel
- Check Node.js version: Set to 20.x in Vercel dashboard
- Clear build cache: Settings → General → Clear Cache

### API routes return 500
- Check environment variables are set
- Review function logs in Vercel dashboard

### Slow performance
- Check SWR refresh interval (currently 3s)
- Reduce if needed in `TaskFeed.tsx`

### OpenAI API errors
- Verify API key is valid
- Check billing/rate limits
- Fall back to mock mode works automatically

---

## Custom Domain Setup (Vercel)

1. Go to your project in Vercel
2. Settings → Domains
3. Add your domain: `ava-mirror.yourdomain.com`
4. Update DNS records as instructed
5. Wait for propagation (5-60 minutes)

---

## Scaling Considerations

### Current Architecture
- Stateless API routes (easily scalable)
- No database (uses mock data)
- Client-side polling (manageable up to 1k concurrent users)

### Future Scaling
- Add Redis for shared state
- Replace polling with WebSockets
- Use edge functions for global low latency
- Add database for task persistence

---

## Backup & Recovery

### Vercel
- Automatic deployments on git push
- Instant rollback in dashboard
- Deployment history saved

### Self-Hosted
```bash
# Create backup script
pm2 save
tar -czf ava-mirror-backup-$(date +%Y%m%d).tar.gz /path/to/ava-mirror

# Restore
tar -xzf ava-mirror-backup-YYYYMMDD.tar.gz
pm2 resurrect
```

---

## Support

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Deployment Issues](https://github.com/yourusername/ava-mirror/issues)

---

**You're deployed!** 🎉

Share your live URL and let Ava shine!

