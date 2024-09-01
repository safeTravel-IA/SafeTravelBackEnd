import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import Imageschema from '../models/imageschema.js';

const genAI = new GoogleGenerativeAI(process.env.Geminiapikey);
let chatHistory = [];

export async function generateText(req, res) {
  try {
    const lastImage = await Imageschema.findOne().sort({ _id: -1 });
    if (lastImage && lastImage.image) {
      const imageBase64 = lastImage.image.toString('base64');

      const requestData = JSON.stringify({
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                text: req.body.textInput,
              },
            ],
          },
        ],
      });

      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-pro-vision:generateContent?key=${process.env.Geminiapikey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const reqToGoogleAPI = https.request(options, (resFromGoogleAPI) => {
        let responseData = '';

        resFromGoogleAPI.on('data', (chunk) => {
          responseData += chunk;
        });

        resFromGoogleAPI.on('end', () => {
          try {
            const responseObj = JSON.parse(responseData);
            if (
              responseObj &&
              responseObj.candidates &&
              responseObj.candidates.length > 0 &&
              responseObj.candidates[0].content &&
              responseObj.candidates[0].content.parts &&
              responseObj.candidates[0].content.parts.length > 0
            ) {
              const generatedText = responseObj.candidates[0].content.parts[0].text;
              console.log('Generated Text:', generatedText);
              res.status(200).json({ generatedText }); // Send the generated text back to the client
            } else {
              console.error('No valid response data found');
              res.status(500).json({ error: 'No valid response data found' });
            }
          } catch (error) {
            console.error('Error parsing response:', error.message);
            res.status(500).json({ error: 'Error parsing response' });
          }
        });
      });

      reqToGoogleAPI.on('error', (error) => {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Error connecting to Google API' });
      });

      reqToGoogleAPI.write(requestData);
      reqToGoogleAPI.end();
    } else {
      throw new Error('No image found');
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'An error occurred while generating text from the image.' });
  }
}

export async function startChat(req, res) {
  try {
    let { history, userInput } = req.body;

    if (!Array.isArray(history)) {
      history = [];
    }

    chatHistory = history;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 50,
        topP: 0.9,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const result = await chat.sendMessageStream(userInput);
    const response = await result.response;
    const text = response.text();
    console.log("model: ", text);

    chatHistory.push({ role: 'user', parts: userInput });
    chatHistory.push({ role: 'model', parts: text });

    res.json({ generatedText: text, updatedHistory: chatHistory });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'An error occurred while generating text.' });
  }
}