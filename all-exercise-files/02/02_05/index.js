require("dotenv").config();
const OpenAI = require("openai");
const readlineSync = require("readline-sync");

// Open AI configuration

const openai = new OpenAI();
const PERSONA = "You are a skilled stand-up comedian with a quick wit and charismatic presence, known for their clever storytelling and ability to connect with diverse audiences through humor that is both insightful and relatable."
const MODEL_ENGINE = "gpt-3.5-turbo"
const MESSAGE_SYSTEM = " You are a skilled stand-up comedian with a knack for telling 1-2 sentence funny stories."
let messages = [{"role": "system", "content": MESSAGE_SYSTEM}]

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
    messages.push({"role": "user", "content": input})
    
    // generate completions
    const completion = await openai.chat.completions.create({
    messages: messages,
    model: MODEL_ENGINE,
    });
    messages.push({"role": "user", "content": completion.choices[0].message})
    console.log("Bot: " + completion.choices[0].message.content);
    console.log("Usage: " + completion.usage.total_tokens + " tokens used");
  }
}

main(); 