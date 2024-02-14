import OpenAI from "openai";
import express from "express";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI();
const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const LANGUAGE_MODEL = "gpt-3.5-turbo-1106";
const MODEL_ENGINE = "gpt-4-turbo-preview";
const ASSISTANT_NAME = "Math Tutor";
const ASSISTANT_DEFAULT_INSTRUCTIONS =
  "You are a personal math tutor. Write and run code to answer math questions.";

async function uploadToOpenAI(filepath) {
  try {
    // Upload a file with an "assistants" purpose
    const file = await openai.files.create({
      file: fs.createReadStream(filepath),
      purpose: "assistants",
    });
    console.log(file);
    console.log(file.id);
    return file.id;
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

// Step 1: Create an Assistant
const createAssistant = async (file_id) => {
  return await openai.beta.assistants.create({
    name: ASSISTANT_NAME,
    instructions: ASSISTANT_DEFAULT_INSTRUCTIONS,
    tools: [{ type: "retrieval" }],
    model: MODEL_ENGINE,
    file_ids: [file_id],
  });
};

// Step 2: Create a Thread
const createThread = async () => {
  return await openai.beta.threads.create();
};

// Step 3: Add a Message to a Thread
const addMessageToThread = async (thread, user_input) => {
  try {
    const message = await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: user_input,
    });
    return message;
  } catch (error) {
    console;
  }
};

// Step 4: Run the Assistant
const runThread = async (assistant, thread) => {
  try {
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id,
      instructions: "Please address the user as Rok Benko.",
    });
    console.log("This is the run object: ", run, "\n");

    return run;
  } catch (error) {
    console.error(error);
  }
};

// Step 5: Check the Run Status
const checkRunStatus = async (run, thread) => {
  try {
    const _run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    console.log("This is the run status: ", _run.status, "\n");
  } catch (error) {
    console.error(error);
  }
};

// Step 6: Retrieve and display the Messages
const retrieveMessages = async (run, thread) => {
  if (run.status === "completed") {
    console.log("This is the run status: ", run.status, "\n");
    const messages = await openai.beta.threads.messages.list(thread.id);

    // display messages

    if (messages.data[0].content[0].text) {
      return messages.data[0].content[0].text.value;
    }
  }
};

let assistant, thread;

async function main(_, res) {
  // Step 0: Create a File
  const file_id = await uploadToOpenAI("files/faq_abc.txt");

  // Step 1: Create an Assistant
  assistant = await createAssistant(file_id);
  // Step 2: Create a Thread
  thread = await createThread();
  res.status(200).send(thread);
}

async function sendMessage(req, res) {
  const message = await addMessageToThread(thread, req.body.input);
  console.log("user: ", message.content[message.content.length - 1].text.value);

  // Step 4: Run the Assistant
  let run = await runThread(assistant, thread);

  // Step 5: Check the Run Status
  while (run.status !== "completed") {
    await checkRunStatus(run, thread);
    // Re-fetch the run status inside the loop
    run = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    if (run.status === "failed" || run.status === "expired") {
      console.log("Chat terminated.");
      // process.exit();
    }
  }
  // Step 6: Retrieve and display the Messages
  const messages = await retrieveMessages(run, thread);
  console.log(messages);
  res.status(200).send({
    sender: "ai_assistant",
    content: messages,
    flagged: false,
    timestamp: new Date(),
  });
}

app.get("/", main);
app.post("/sendMessage", sendMessage);

app.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});
