#!/bin/bash

set -e  

if [ -f .env ]; then
  export $(cat .env | xargs)
fi

echo "Starting bot setup..."

npx prisma generate

npx prisma db push

echo "Bot setup complete. Starting the bot..."

npm run dev

trap 'echo "Error occurred. Exiting..."' ERR

tail -f /dev/null
