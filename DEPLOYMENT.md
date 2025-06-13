# Deployment Guide

This guide covers deploying the migrated Astro application to production.

## Quick Start

### Development
```bash
# Start Astro development server
deno task astro:dev

# Start Fresh development server (for comparison)
deno task web:start
```

### Production Build
```bash
# Build Astro application
deno task astro:build

# Preview production build
deno task astro:preview
```

## Deployment Options

### 1. Deno Deploy (Recommended)
The application is configured with the Deno adapter and can be deployed directly to Deno Deploy:

```bash
# Deploy to Deno Deploy
deployctl deploy --project=agilestory-blog astro/dist/server/entry.mjs
```

### 2. Self-hosted Deno
Run the built application on your own server:

```bash
# After building
cd astro/dist
deno run --allow-net --allow-read server/entry.mjs
```

### 3. Docker Deployment
Create a Dockerfile for containerized deployment:

```dockerfile
FROM denoland/deno:1.40.0

WORKDIR /app
COPY astro/dist/ .

EXPOSE 3000

CMD ["run", "--allow-net", "--allow-read", "server/entry.mjs"]
```

## Environment Configuration

### Required Environment Variables
- `AGILEDATA`: Path to data storage (for CLI tools)

### Optional Configuration
- `PORT`: Server port (default: 3000)
- `HOST`: Server host (default: localhost)

## Performance Considerations

### 1. Static Assets
- CSS and JavaScript are optimized during build
- Fonts and images are served from `/public` directory
- Consider CDN for static asset delivery

### 2. Korean Language Support
- UTF-8 encoding is properly configured
- Korean text rendering tested across browsers
- Search functionality optimized for Korean characters

### 3. SEO Optimization
- Meta tags configured for Korean content
- Open Graph and Twitter cards implemented
- Sitemap generation recommended for production

## Monitoring

### Health Checks
Monitor these endpoints:
- `GET /` - Home page health
- `GET /search` - Search functionality
- `GET /[valid-post-id]` - Post rendering

### Performance Metrics
- Page load times
- Search response times
- Korean text rendering performance
- Memory usage for large post collections

## Rollback Plan

If issues arise, the original Fresh application is maintained:

```bash
# Switch back to Fresh
deno task web:start    # Development
deno task web:build    # Production build
deno task web:preview  # Production preview
```

## Data Management

### Content Updates
```bash
# Download latest content from Internet Archive
AGILEDATA=/path/to/data deno task tool:download

# Generate updated data.json
AGILEDATA=/path/to/data deno task tool:dump-file data.json
```

### Backup Strategy
- Regular backups of `data.json`
- Version control for code changes
- Archive Internet Archive snapshots

## Security

### Headers
The application sets security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### Content Security
- All external links are filtered
- Internet Archive URLs are sanitized
- XSS protection for search queries

## Troubleshooting

### Common Issues

**Build Warnings About Sharp**
- Non-blocking warnings about image processing
- Doesn't affect functionality
- Consider alternative image optimization

**TypeScript Path Resolution**
- Development-only issue
- Doesn't affect production builds
- Can be safely ignored

**Korean Text Issues**
- Ensure UTF-8 encoding
- Check font loading
- Verify browser language settings

### Support

For migration-related issues:
1. Check the Fresh version works correctly
2. Compare component behavior between versions
3. Review shared business logic tests
4. Verify data integrity with verification script

## Success Metrics

### Functional Success
- ✅ All URLs return 200 status codes
- ✅ Korean content displays correctly
- ✅ Search returns relevant results
- ✅ Navigation between posts works

### Performance Success
- ✅ Page load times comparable to Fresh
- ✅ Search response under 500ms
- ✅ Memory usage stable under load
- ✅ No JavaScript errors in console

**🎉 The Astro application is ready for production deployment!**