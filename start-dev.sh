#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== Starting StayVision Development Environment =====${NC}"

# Install dependencies if needed
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd frontend
npm install

echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd ../backend
npm install

# Start both servers in parallel
echo -e "${GREEN}Starting backend server...${NC}"
cd ../backend
npm run dev &
BACKEND_PID=$!

echo -e "${GREEN}Starting frontend development server...${NC}"
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Function to handle exit and kill all child processes
function cleanup {
  echo -e "${YELLOW}Stopping servers...${NC}"
  kill $BACKEND_PID
  kill $FRONTEND_PID
  exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

# Wait for user to press Ctrl+C
echo -e "${GREEN}Both servers running. Press Ctrl+C to stop.${NC}"
wait
