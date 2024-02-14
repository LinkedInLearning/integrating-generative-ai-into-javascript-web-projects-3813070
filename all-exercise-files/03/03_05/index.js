import OpenAI from "openai";
import fetch from "node-fetch";
import dotenv from "dotenv";
import readlineSync from "readline-sync";
dotenv.config();

let messages = [{ role: "system", content: "You are a professional assistant?" }];
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  const json = await response.json();
  console.log(json)

  // documentation : https://openweathermap.org/current
  const weatherInfo = {
    location: loc,
    temperature: "22",
    unit: "celsius",
    forecast: "sunny",
  };
  return JSON.stringify(weatherInfo);
}

async function runConversation(messages) {
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

    
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: messages,
    tools: tools,
    tool_choice: "auto", // auto is default, but we'll be explicit
  });
  const responseMessage = response.choices[0].message;
  // Step 2: check if the model wanted to call a function
  const toolCalls = responseMessage.tool_calls;
  if (!responseMessage.tool_calls) {
    return response;
  }
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
    const functionResponse = await functionToCall(
      functionArgs.location,
      functionArgs.unit
    );
    // Step 4: send the info on the function call and function response to GPT
    // extend conversation with function response
    // messages.push({
    //   tool_call_id: toolCall.id,
    //   role: "tool",
    //   name: functionName,
    //   content: functionResponse,
    // }); // extend conversation with function response
    try {
      // const secondResponse = await openai.chat.completions.create({
      //   model: "gpt-3.5-turbo-1106",
      //   messages: messages,
      // }); // get a new response from the model where it can see the function response
      // return secondResponse;
    } catch (e) {
      console.error(e);
    }
  }
}

const start = async () => {
  console.log("\n\n----------------------------------");
  console.log("          CHAT WITH AI 🤖   ");
  console.log("----------------------------------\n");
  console.log("\nBot: How can I help you?");

  while (true) {
    const input = getInput("You: ");
    if (input === "x") {
      console.log("Goodbye!");
      process.exit();
    }
    messages.push({"role": "user", "content": input})
    const response = await runConversation(messages)
    console.log("Bot: ", response.choices[0].message.content)  
  }
};

start()

