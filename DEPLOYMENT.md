# Vercel Deployment Guide

## Prerequisites
- Vercel account
- GitHub repository connected to Vercel
- Environment variables configured

## Step 1: Environment Variables Setup

In your Vercel project settings, add these environment variables:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
NEXT_PUBLIC_NETWORK_ID=42220
NEXT_PUBLIC_NETWORK_NAME=Celo
```

## Step 2: Build Configuration

The project is configured with:
- `vercel.json` - Vercel-specific configuration
- `next.config.js` - Next.js configuration with proper webpack fallbacks
- `.nextignore` - Excludes unnecessary files from build

## Step 3: Deployment Steps

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Configure Build Settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Environment Variables**: Add the required environment variables in Vercel dashboard

4. **Deploy**: Trigger deployment from Vercel dashboard

## Step 4: Troubleshooting

### Common Issues:

1. **404 Error**: 
   - Check if all environment variables are set
   - Verify the build is successful
   - Check Vercel function logs

2. **Build Failures**:
   - Ensure all dependencies are in `package.json`
   - Check for TypeScript errors
   - Verify Node.js version compatibility

3. **API Routes Not Working**:
   - Test `/api/health` endpoint
   - Check Vercel function logs
   - Verify route handlers are properly exported

### Debugging Commands:

```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Test scan detection endpoint
curl https://your-app.vercel.app/api/scan-detected
```

## Step 5: Post-Deployment

1. **Test the Application**:
   - Visit the main page
   - Test QR code generation
   - Verify API endpoints work
   - Test claim functionality

2. **Monitor Logs**:
   - Check Vercel function logs for errors
   - Monitor API route performance
   - Watch for any runtime errors

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed contract address | Yes | - |
| `NEXT_PUBLIC_NETWORK_ID` | Celo network ID | No | 42220 |
| `NEXT_PUBLIC_NETWORK_NAME` | Network name | No | Celo |

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Test locally with `npm run dev`
3. Verify environment variables are set correctly
4. Check the health endpoint at `/api/health` 