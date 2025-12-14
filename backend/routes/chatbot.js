const express = require('express');
const router = express.Router();
const axios = require('axios');

// System prompts for different languages
const systemPrompts = {
  en: `You are a helpful AI assistant for Niti Nidhi, a government schemes portal for Indian citizens. Provide accurate information about Indian government schemes, eligibility criteria, application procedures, and benefits. Be concise and helpful.`,
  
  hi: `आप नीति निधि के लिए एक सहायक हैं, जो भारतीय सरकारी योजनाओं का पोर्टल है। भारतीय सरकारी योजनाओं, पात्रता मानदंड, आवेदन प्रक्रियाओं और लाभों के बारे में सटीक जानकारी प्रदान करें। संक्षिप्त और सहायक रहें।`
};

// Chat endpoint using direct REST API call
router.post('/chat', async (req, res) => {
  try {
    const { message, language = 'en', conversationHistory = [] } = req.body;

    // Validation
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: language === 'hi' 
          ? 'संदेश आवश्यक है' 
          : 'Message is required'
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found');
      return res.status(500).json({
        success: false,
        message: 'API key not configured'
      });
    }

    console.log(`[Chatbot] Request - Language: ${language}, Message: ${message.substring(0, 50)}...`);

    // Build the prompt
    const systemPrompt = systemPrompts[language] || systemPrompts.en;
    let fullPrompt = systemPrompt + '\n\n';
    
    // Add conversation history
    if (conversationHistory && conversationHistory.length > 0) {
      const recent = conversationHistory.slice(-4);
      recent.forEach(msg => {
        fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
    }
    
    fullPrompt += `User: ${message}\nAssistant:`;

    // Direct REST API call to Gemini - using gemini-1.5-flash (latest stable model)
    const modelName = 'gemini-1.5-flash'; // Updated model name
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    // Extract the response text
    const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No response generated');
    }

    console.log('[Chatbot] Response generated successfully');

    res.json({
      success: true,
      response: generatedText,
      language: language,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Chatbot] Error:', error.response?.data || error.message);
    
    let errorMessage = 'Failed to generate response';
    let statusCode = 500;

    if (error.response?.status === 400) {
      errorMessage = language === 'hi' 
        ? 'अमान्य अनुरोध। कृपया पुनः प्रयास करें।'
        : 'Invalid request. Please try again.';
      statusCode = 400;
    } else if (error.response?.status === 429) {
      errorMessage = language === 'hi' 
        ? 'बहुत सारे अनुरोध। कृपया बाद में प्रयास करें।'
        : 'Too many requests. Please try again later.';
      statusCode = 429;
    } else if (error.response?.status === 403 || error.response?.data?.error?.message?.includes('API key')) {
      errorMessage = language === 'hi' 
        ? 'API कुंजी अमान्य है।'
        : 'Invalid API key.';
      statusCode = 403;
    } else if (!error.response) {
      errorMessage = language === 'hi' 
        ? 'नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।'
        : 'Network error. Please try again.';
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? (error.response?.data || error.message) : undefined
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  const isConfigured = !!process.env.GEMINI_API_KEY;
  res.json({
    success: true,
    message: 'Chatbot service is running',
    apiKeyConfigured: isConfigured,
    status: isConfigured ? 'ready' : 'not configured',
    timestamp: new Date().toISOString()
  });
});

// Get supported languages
router.get('/languages', (req, res) => {
  res.json({
    success: true,
    languages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' }
    ]
  });
});

module.exports = router;