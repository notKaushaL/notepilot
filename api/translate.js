// Vercel API route for translation proxy
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, sourceLang = 'auto', targetLang } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Use Google Translate free API
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Translation-Service/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`Translation service error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data) || !data[0]) {
      throw new Error('Invalid translation response');
    }

    const translatedText = data[0]
      .filter(item => item && item[0])
      .map(item => item[0])
      .join('');

    res.status(200).json({
      translatedText,
      sourceLanguage: data[2] || sourceLang,
      targetLanguage: targetLang,
      provider: 'Google Translate (Vercel)',
      confidence: 0.90
    });

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ 
      error: 'Translation failed', 
      message: error.message 
    });
  }
}