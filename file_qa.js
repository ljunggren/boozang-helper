#!/usr/bin/env node
/* Minimal “file-question” CLI using OpenAI SDK v4
 *   usage: file_qa <filename> -q "your question" [--model gpt-3.5-turbo-0125]
 */
import fs from "node:fs/promises";
import path from "node:path";
import { argv, exit, stdout } from "node:process";
import OpenAI from "openai";

const CHUNK_SIZE = 8_000;              // chars per chunk
const HELP = `
usage: file_qa <filename> -q "your question" [--model gpt-4o-mini]

env:
  OPENAI_API_KEY   required

examples:
  docker run -e OPENAI_API_KEY=sk-… -v $PWD:/work openai-file-qa-js \
     mylog.txt -q "Summarise failures"
`;

function parseArgs() {
  if (argv.length < 4 || argv.includes("-h") || argv.includes("--help")) {
    console.error(HELP); exit(1);
  }
  const fname = argv[2];
  const qIdx = argv.indexOf("-q") !== -1 ? argv.indexOf("-q") : argv.indexOf("--question");
  if (qIdx === -1 || !argv[qIdx + 1]) {
    console.error("ERROR: -q \"question\" is required"); exit(1);
  }
  const question = argv[qIdx + 1];
  const modelFlag = argv.findIndex(a => a === "--model");
  const model = modelFlag !== -1 && argv[modelFlag + 1] ? argv[modelFlag + 1] : "gpt-4o-mini";
  return { fname, question, model };
}

async function main() {
  const { fname, question, model } = parseArgs();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) { console.error("OPENAI_API_KEY missing"); exit(1); }

  const openai = new OpenAI({ apiKey });

  let fileText;
  try {
    fileText = await fs.readFile(path.resolve("/work", fname), "utf8");
  } catch (err) {
    console.error("Cannot read file:", err.message); exit(1);
  }

  const chunks = [];
  for (let i = 0; i < fileText.length; i += CHUNK_SIZE) {
    chunks.push(fileText.slice(i, i + CHUNK_SIZE));
  }

  const context = {
    role: "system",
    content:
      "You are Boozang Log-Doctor. Use the FILE content to answer the question concisely."
  };

  for (let i = 0; i < chunks.length; i++) {
    const userChunk = { role: "user", content: `[FILE CHUNK ${i + 1}]\n${chunks[i]}` };
    const questionMsg = { role: "user", content: question };

    const stream = await openai.chat.completions.create({
      model,
      stream: true,
      messages: [context, userChunk, questionMsg],
      temperature: 0.3
    });

    for await (const part of stream) {
      stdout.write(part.choices[0].delta?.content || "");
    }
  }
  stdout.write("\n");
}

main();
