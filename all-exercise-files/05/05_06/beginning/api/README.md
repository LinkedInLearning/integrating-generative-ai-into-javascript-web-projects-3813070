## OpenAI - Quickstart

- **express**: framework Node.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
- **nodemon**: utility that will monitor for any changes in your source and automatically restart your server.
- **dotenv**: zero-dependency module that loads environment variables from a .env file into process.env.
- **readline-sync**:
- **openai**:   OpenAI API library for Node.js projects. This library provides convenient access to the OpenAI API from applications written in server-side JavaScript.

## [Postman](https://www.postman.com/downloads/)
Postman is an API platform for building and using APIs. 

- use [web version](https://web.postman.co/home)

## [get an key](https://platform.openai.com/account/api-keys)

`export OPENAI_API_KEY=sk-QyF9VMXg.... jkYAUItPxhspQlpi`

## Installation :
`npm install`

## Start:
`npm start`


## Send API REQUEST:
```
curl -X POST http://localhost:4000/sendMessage \
  -H 'Content-Type: application/json' \
  -d '{
    "input": "what are the opening hours ?",
  }'
```


