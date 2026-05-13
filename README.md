# Wizard Wash Review Generator

AI-powered review generation page for Wizard Wash customers. Customers click a smiley face in a post-service email, land on this page, and get an AI-written SEO-friendly review they can paste into Google Reviews.

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "wizard wash review generator"
git remote add origin https://github.com/YOUR_USERNAME/wizard-wash-review.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import the `wizard-wash-review` repo
4. In the Environment Variables section, add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your Anthropic API key from https://console.anthropic.com/settings/keys
5. Click "Deploy"

### 3. Update your Zoho email

Once deployed, Vercel gives you a URL like `https://wizard-wash-review.vercel.app`.

In your Zoho Flow email template, replace `https://YOURDOMAIN.com/review` with your Vercel URL in all three smiley face links.

Example:
```
https://wizard-wash-review.vercel.app?rating=5&name=${trigger.Deal_Name}
```

### Custom domain (optional)

In Vercel dashboard > Settings > Domains, you can add a custom subdomain like `review.wizardwashva.com` and point a CNAME record to it.

## Cost

Each review generation costs roughly $0.003 (one third of a cent) using Claude Sonnet. Even at 100 reviews per month that is about $0.30/month.
