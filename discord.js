require("dotenv").config({ path: "./.env" });
const { Configuration, OpenAIApi } = require("openai");
const { Client, IntentsBitField } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", () => {
  console.log("The bot is online!");
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

let conversationLog = [];
client.on("messageCreate", async (message) => {

  if (message.author.bot) return;
  if (message.content.startsWith("!")) return;
  if (message.content === "clear") {
    conversationLog = [];
    message.reply("converstaionLog clear")
    return;
  }
  conversationLog.push({
    role: "user",
    content: message.content,
    name: message.author.username,
  });
  await message.channel.sendTyping();
  const result = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: conversationLog,
  });
  await message.channel.sendTyping();
  const response = result.data.choices[0].message.content;
  if (response.length < 1999) {
    message.reply(response);
  } else {
    const chunk = splitString(response, 1999);
    for (let i = 0; i < chunk.length; i++) {
      message.reply(chunk[i]);
    }
  }
});

client.login(process.env.TOKEN);

const splitString = (string, maxSize) => {
  let chunk = [];
  let index = 0;
  while (index <= string.length) {
    chunk.push(string.slice(index, index + maxSize));
    index += maxSize;
  }
  return chunk;
};
