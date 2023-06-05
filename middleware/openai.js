const {Configuration, OpenAIApi} = require('openai')

const configuration = new Configuration({
    apiKey:"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",
});
const openai = new OpenAIApi(configuration);

const runPropt = async (msg) => {

   
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{"role": "user", "content": `${msg}`}]
      });

  return (response.data.choices)
}

module.exports = runPropt