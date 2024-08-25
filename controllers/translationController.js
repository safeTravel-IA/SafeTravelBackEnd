// controllers/translationController.js
import translateText from '../services/translationService.js';
import Translation from '../models/translation.js';
export const translateController = async (req, res) => {
    try {
        const { text, from, to, userId } = req.body; // Use userId from request body
        const translatedText = await translateText(text, from, to, userId);
        
        const translationData = new Translation({
            inputText: text,
            outputText: translatedText,
            userId: userId, // Include userId in the Translation object
        });
        await translationData.save();

        res.json({ translatedText });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
