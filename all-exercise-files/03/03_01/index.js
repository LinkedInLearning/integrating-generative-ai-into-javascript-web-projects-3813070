require("dotenv").config();
const OpenAI = require("openai");
const readlineSync = require("readline-sync");

// Open AI configuration
const MESSAGE_SYSTEM = "You are helpful and professional assistant."
const MODEL_ENGINE = "gpt-3.5-turbo"
let messages = [{ role: "system", content: MESSAGE_SYSTEM }]
const openai = new OpenAI();

// Get user input
function getInput(promptMessage) {
  return readlineSync.question(promptMessage, {
    hideEchoBack: false, // The typed characters won't be displayed if set to true
  });
}

async function main() {
  console.log("\n\n----------------------------------");
  console.log("          CHAT WITH AI 🤖   ");
  console.log("----------------------------------\n");
  console.log("type 'x' to exit the conversation");
  runConversation();
}

async function runConversation() {
    while (true) {
    const input = getInput("You: ");
    if (input === "x") {
      console.log("Goodbye!");
      process.exit();
    }
    messages.push({ role: "user", content: input });
    const completion = await openai.chat.completions.create({
      messages: messages,
      model: MODEL_ENGINE,
    });
    messages.push(completion.choices[0].message);
    console.log(completion.choices[0].message.content);
  }
}

main(); 