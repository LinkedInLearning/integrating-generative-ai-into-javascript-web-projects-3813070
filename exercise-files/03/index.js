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
  // Step 1: send the conversation and available functions to the model
  const messages = [
    { role: "user", content: "What's the weather like in San Francisco, Tokyo, and Paris?" },
  ];
  const tools = [
    {
      type: "function",
      function: {
        name: "get_current_weather",
        description: "Get the current weather in a given location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g. San Francisco, CA",
            },
            unit: { type: "string", enum: ["celsius", "fahrenheit"] },
          },
          required: ["location"],
        },
      },
    },
  ];

  while (true) {
    const input = getInput("You: ");
    if (input === "x") {
      console.log("Goodbye!");
      process.exit();
    }
    messages.push({ role: "user", content: input });
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: messages,
      tools: tools,
      tool_choice: "auto", // auto is default, but we'll be explicit
    });
    const responseMessage = response.choices[0].message;

  // Step 2: check if the model wanted to call a function
  const toolCalls = responseMessage.tool_calls;
  console.log(toolCalls.length > 0) 
  }
 
}

main(); 