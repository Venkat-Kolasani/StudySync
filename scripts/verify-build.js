#!/usr/bin/env node

/**
 * This script helps verify your production build locally before deployment.
 * Run with: node scripts/verify-build.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}StudySync Production Build Verification${colors.reset}`);
console.log(`${colors.cyan}=====================================${colors.reset}\n`);

// Check if env files exist
console.log(`${colors.blue}Checking environment files...${colors.reset}`);
const envFiles = ['.env', '.env.production', '.env.local'];
let envFound = false;

envFiles.forEach(file => {
  if (fs.existsSync(path.join(process.cwd(), file))) {
    console.log(`${colors.green}✓ Found ${file}${colors.reset}`);
    envFound = true;
  }
});

if (!envFound) {
  console.log(`${colors.yellow}⚠ No environment files found. Make sure to configure environment variables in Vercel.${colors.reset}`);
}

// Run production build
console.log(`\n${colors.blue}Building production version...${colors.reset}`);
exec('npm run build', (error, stdout, stderr) => {
  if (error) {
    console.log(`${colors.red}✗ Build failed:${colors.reset}`);
    console.error(error);
    return;
  }
  
  console.log(`${colors.green}✓ Production build completed successfully${colors.reset}`);
  
  // Check build output
  console.log(`\n${colors.blue}Checking build output...${colors.reset}`);
  if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
    const files = fs.readdirSync(path.join(process.cwd(), 'dist'));
    console.log(`${colors.green}✓ Build output directory found with ${files.length} files/directories${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Build output directory not found${colors.reset}`);
    return;
  }

  // Start preview server
  console.log(`\n${colors.blue}Starting preview server...${colors.reset}`);
  console.log(`${colors.yellow}Please test the application at http://localhost:4173${colors.reset}`);
  console.log(`${colors.yellow}Consider testing:${colors.reset}`);
  console.log(`${colors.yellow}- User authentication${colors.reset}`);
  console.log(`${colors.yellow}- Resource uploading and sharing${colors.reset}`);
  console.log(`${colors.yellow}- Group creation and management${colors.reset}`);
  console.log(`${colors.yellow}- Study session scheduling${colors.reset}\n`);
  
  exec('npm run preview', (error, stdout, stderr) => {
    if (error) {
      console.log(`${colors.red}✗ Preview failed to start:${colors.reset}`);
      console.error(error);
      return;
    }
  });
});
