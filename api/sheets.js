// api/sheets.js
export default async function handler(req, res) {
    const { sheet } = req.query;
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
    const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

    // Check rate limiting
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (!checkRateLimit(ip)) {
        return res.status(429).json({ error: 'កំពុងមានអ្នកប្រើប្រាស់ច្រើនពេក។ សូមព្យាយាមម្តងទៀតក្នុងរយៈពេល ១ នាទី។' });
    }

    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheet}?key=${API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch from Google Sheets');
        }
        
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching sheet data:', error);
        res.status(500).json({ error: 'មិនអាចទាញយកទិន្នន័យបានទេ' });
    }
}

// Simple rate limiting function
const rateLimitMap = new Map();

function checkRateLimit(ip) {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, []);
    }
    
    const requests = rateLimitMap.get(ip).filter(time => time > windowStart);
    rateLimitMap.set(ip, requests);
    
    if (requests.length >= 30) { // 30 requests per minute per IP
        return false;
    }
    
    requests.push(now);
    return true;
}