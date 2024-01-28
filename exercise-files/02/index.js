require("dotenv").config();
const OpenAI = require("openai");
const readlineSync = require("readline-sync");

// Open AI configuration
let messages = [{ role: "system", content: "You are a funny assistant." }]
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
      model: "gpt-3.5-turbo",
    });
    messages.push(completion.choices[0].message);
    console.log(completion.choices[0].message.content);
  }
}

main(); 