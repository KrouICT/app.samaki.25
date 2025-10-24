// api/sheets.js
export default async function handler(req, res) {
    const { sheet } = req.query;
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
    const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

    // Simple rate limiting
    const rateLimitMap = new Map();
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    function checkRateLimit(ip) {
        const now = Date.now();
        const windowStart = now - 60000;
        
        if (!rateLimitMap.has(ip)) {
            rateLimitMap.set(ip, []);
        }
        
        const requests = rateLimitMap.get(ip).filter(time => time > windowStart);
        rateLimitMap.set(ip, requests);
        
        if (requests.length >= 30) {
            return false;
        }
        
        requests.push(now);
        return true;
    }

    if (!checkRateLimit(ip)) {
        return res.status(429).json({ error: 'Too many requests' });
    }

    try {
        if (!sheet) {
            return res.status(400).json({ error: 'Sheet name is required' });
        }

        if (!API_KEY || !SPREADSHEET_ID) {
            throw new Error('API key or Spreadsheet ID not configured');
        }

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheet}?key=${API_KEY}`;
        console.log('Fetching sheet data from:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                return res.status(404).json({ error: 'Sheet not found' });
            }
            throw new Error(`Google Sheets API error: ${response.status}`);
        }
        
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error in sheets API:', error);
        res.status(500).json({ 
            error: 'មិនអាចទាញយកទិន្នន័យបានទេ',
            details: error.message 
        });
    }
}
