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


function kelvinToCelsius(kelvin) {
  return JSON.stringify(Math.round(kelvin - 273.15));
}

function geoCode(location) {
  return new Promise(async (resolve, reject) => {
    try {
      const coordinates = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=${process.env.WEATHER_API_KEY}`
      );
      const json = await coordinates.json();
      const lat = json[0]?.lat;
      const lon = json[0]?.lon;
      resolve({ lat, lon });
    } catch (err) {
      console.log(err);
    }
  });
}

// Example dummy function hard coded to return the same weather
// In production, this could be your backend API or an external API
async function getCurrentWeather(location, unit = "fahrenheit") {
  const loc = location.split(",")[0];
  const { lat, lon } = await geoCode(loc);
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}`
  );

  console.log(response)
  //parse the response and return the weather info as a JSON object

  // ...
  const weatherInfo = {
    location: "Paris",
    temperature: "22",
    unit: "celsius",
    forecast: "sunny",
  };
  return JSON.stringify(weatherInfo);
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
  if (responseMessage.tool_calls) {
    // Step 3: call the function
    // Note: the JSON response may not always be valid; be sure to handle errors
    const availableFunctions = {
      get_current_weather: getCurrentWeather,
    }; // only one function in this example, but you can have multiple
    messages.push(responseMessage); // extend conversation with assistant's reply
    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionToCall = availableFunctions[functionName];
      const functionArgs = JSON.parse(toolCall.function.arguments);
      const functionResponse = functionToCall(
        functionArgs.location,
        functionArgs.unit
      );
      console.log(functionResponse)
      // Step 4: append the JSON object to the conversation
    }
     // Step 5: extend the conversation with the function's response
    }
  }
}

main(); 