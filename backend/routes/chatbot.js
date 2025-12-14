const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const jwt = require('jsonwebtoken');

// Initialize Gemini AI
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
  console.warn('⚠️ GEMINI_API_KEY not configured. Chatbot will use fallback responses.');
}

// Middleware to verify token (optional for chatbot - allow unauthenticated)
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    // Allow chatbot to work without authentication
    req.userId = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    // Allow chatbot to work even with invalid/expired token
    console.log('Chatbot: Invalid token, but allowing access:', error.message);
    req.userId = null;
    next();
  }
};

// Chat with AI using Gemini
router.post('/chat', verifyToken, async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    if (!genAI) {
      const fallbackResponse = language === 'hi'
        ? 'क्षमा करें, AI सेवा अभी उपलब्ध नहीं है। कृपया GEMINI_API_KEY को कॉन्फ़िगर करें।'
        : 'Sorry, AI service is not available. Please configure GEMINI_API_KEY.';
      return res.json({
        success: true,
        response: fallbackResponse,
        language,
      });
    }

    const systemPrompt = language === 'hi' 
      ? `आप नीति निधि सरकारी ऐप के लिए एक सहायक हैं। आप सरकारी योजनाओं, सेवाओं और प्रक्रियाओं के बारे में विस्तृत और सटीक जानकारी प्रदान करते हैं। हमेशा हिंदी में उत्तर दें और उपयोगी जानकारी प्रदान करें।`
      : `You are a helpful assistant for the Niti Nidhi government app. You provide detailed and accurate information about government schemes, services, and procedures. Always answer in English and provide helpful information.`;

    console.log('Calling Gemini API with language:', language);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `${systemPrompt}\n\nUser: ${message}\n\nAssistant:`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    console.log('Gemini response received:', aiResponse.substring(0, 100));

    res.json({
      success: true,
      response: aiResponse,
      language,
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    console.error('Error details:', error.message, error.stack);
    
    // More detailed error response
    const fallbackResponse = req.body.language === 'hi'
      ? `क्षमा करें, एक त्रुटि हुई: ${error.message}. कृपया बाद में पुनः प्रयास करें या GEMINI_API_KEY जांचें।`
      : `Sorry, an error occurred: ${error.message}. Please try again later or check GEMINI_API_KEY configuration.`;

    res.json({
      success: true,
      response: fallbackResponse,
      language: req.body.language || 'en',
    });
  }
});

module.exports = router;
