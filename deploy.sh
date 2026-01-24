#!/bin/bash

# PreHire Deployment Script
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 Starting PreHire deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$APP_DIR/logs"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

echo -e "${YELLOW}📁 Working directory: $APP_DIR${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

if ! command_exists pm2; then
    echo -e "${YELLOW}⚠️  PM2 not found. Installing globally...${NC}"
    npm install -g pm2
fi

# Pull latest code (if using git)
if [ -d ".git" ]; then
    echo -e "${YELLOW}📥 Pulling latest code from repository...${NC}"
    git pull origin main || git pull origin master
else
    echo -e "${YELLOW}⚠️  Not a git repository. Skipping pull.${NC}"
fi

# Install backend dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd "$APP_DIR/backend"
npm install --production

# Install AI service dependencies
echo -e "${YELLOW}📦 Installing AI service dependencies...${NC}"
cd "$APP_DIR/ai-service"
npm install --production

# Install frontend dependencies and build
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
cd "$APP_DIR/frontend"
npm install

echo -e "${YELLOW}🔨 Building frontend for production...${NC}"
npm run build

# Stop existing PM2 processes
echo -e "${YELLOW}🛑 Stopping existing services...${NC}"
cd "$APP_DIR"
pm2 stop ecosystem.config.js 2>/dev/null || echo "No existing processes to stop"

# Start services with PM2
echo -e "${YELLOW}🚀 Starting services with PM2...${NC}"
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Wait for services to start
sleep 5

# Health checks
echo -e "${YELLOW}🏥 Performing health checks...${NC}"

# Check backend
BACKEND_HEALTH=$(curl -s http://localhost:5001/health || echo "failed")
if [[ $BACKEND_HEALTH == *"ok"* ]]; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    pm2 logs prehire-backend --lines 50
    exit 1
fi

# Check AI service
AI_HEALTH=$(curl -s http://localhost:3001/health || echo "failed")
if [[ $AI_HEALTH == *"ok"* ]] || [ "$AI_HEALTH" != "failed" ]; then
    echo -e "${GREEN}✅ AI Service is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  AI Service health check inconclusive (service may not have /health endpoint)${NC}"
fi

# Display PM2 status
echo -e "${YELLOW}📊 Service Status:${NC}"
pm2 list

echo ""
echo -e "${GREEN}✨ Deployment completed successfully!${NC}"
echo ""
echo "Services:"
echo "  Backend:    http://localhost:5001"
echo "  AI Service: http://localhost:3001"
echo "  Frontend:   http://localhost:3000 (or serve build/ directory)"
echo ""
echo "Logs directory: $LOG_DIR"
echo "View logs: pm2 logs"
echo "Monitor: pm2 monit"
echo ""
