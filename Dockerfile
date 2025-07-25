# ---------- Dockerfile ----------
FROM node:20-slim

# 1. Install the official OpenAI SDK
RUN npm install -g openai@4

# 2. Copy CLI script into PATH
WORKDIR /work
COPY file_qa.js /usr/local/bin/file_qa
RUN chmod +x /usr/local/bin/file_qa

ENTRYPOINT ["file_qa"]
