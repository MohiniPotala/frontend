#!/bin/bash

# Run Jest tests
echo "Running tests..."
npx jest --config=jest.config.js

# Check if tests passed
if [ $? -eq 0 ]; then
  echo "✅ All tests passed!"
  exit 0
else
  echo "❌ Tests failed!"
  exit 1
fi