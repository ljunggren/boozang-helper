FROM node:20-slim

# Install only what the script needs in the workdir
WORKDIR /work
RUN npm install openai@4

COPY file_qa.js /usr/local/bin/file_qa
RUN chmod +x /usr/local/bin/file_qa

ENTRYPOINT ["file_qa"]
