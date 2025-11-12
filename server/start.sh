#!/bin/bash

# Increase memory limit to 8GB
export NODE_OPTIONS="--max-old-space-size=8192"

echo "🚀 Starting ComideX server with 8GB memory limit..."

# Start the server
npm run dev