// services/translationService.js
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Translation from '../models/translation.js';

const key = "0e3c356977c94caa86023b054db890e5";
const endpoint = "https://api.cognitive.microsofttranslator.com/";
const location = "westus2";

const translateText = async (text, from, to, userId) => { // Changed parameter from userEmail to userId
    try {
        const response = await axios({
            baseURL: endpoint,
            url: '/translate',
            method: 'post',
            headers: {
                'Ocp-Apim-Subscription-Key': key,
                'Ocp-Apim-Subscription-Region': location,
                'Content-type': 'application/json',
                'X-ClientTraceId': uuidv4().toString()
            },
            params: {
                'api-version': '3.0',
                'from': from,
                'to': to
            },
            data: [{
                'text': text
            }],
            responseType: 'json'
        });

        if (response.status === 200 && response.data && response.data[0]?.translations[0]?.text) {
            const translatedText = response.data[0].translations[0].text;
            // Save the translation to the database
            const translationData = new Translation({
                inputText: text,
                outputText: translatedText,
                userId: userId // Include userId in the translation data
            });
            await translationData.save();
            return translatedText;
        } else {
            throw new Error('Translation failed: Invalid response');
        }
    } catch (error) {
        throw new Error('Translation failed: ' + error.message);
    }
};

export default translateText;
