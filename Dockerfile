# ---- 1. base image ----
FROM node:20-slim

# ---- 2. working directory inside the image ----
WORKDIR /app

# ---- 3. install only what the script needs, locally ----
RUN npm install openai@4   # creates /app/node_modules

# ---- 4. copy your CLI script into the same dir ----
COPY file_qa.js .

# ---- 5. run it with Node (no global lookup issues) ----
ENTRYPOINT ["node", "/app/file_qa.js"]
