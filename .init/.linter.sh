#!/bin/bash
cd /home/kavia/workspace/code-generation/intelligent-chatbot-platform-2899-2909/company_chatbot_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

