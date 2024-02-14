require('dotenv').config();
const OpenAI = require('openai');
const readlineSync = require('readline-sync');

// Open AI configuration
const openai = new OpenAI();

// Get user input
function getInput(promptMessage) {
  return readlineSync.question(promptMessage, {
    hideEchoBack: false, // The typed characters won't be displayed if set to true
  });
}

async function main() {
  console.log('\n\n----------------------------------');
  console.log('          CHAT WITH AI 🤖   ');
  console.log('----------------------------------\n');
  console.log("type 'x' to exit the conversation");
  console.log(process.env.OPENAI_API_KEY);
  runConversation();
}

async function runConversation() {
  while (true) {
    const input = getInput('You: ');
    if (input === 'x') {
      console.log("Goodbye!");
      process.exit();
    }

  }
}

main();
