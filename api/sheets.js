// api/sheets.js
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

// Simple in-memory rate limiting
const rateLimitMap = new Map();

function checkRateLimit(ip) {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, []);
    }
    
    const requests = rateLimitMap.get(ip).filter(time => time > windowStart);
    rateLimitMap.set(ip, requests);
    
    // 30 requests per minute per IP
    if (requests.length >= 30) {
        return false;
    }
    
    requests.push(now);
    return true;
}

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', 'https://samakischool.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Check rate limiting
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               'unknown';
    
    if (!checkRateLimit(ip)) {
        return res.status(429).json({ 
            error: 'កំពុងមានអ្នកប្រើប្រាស់ច្រើនពេក។ សូមព្យាយាមម្តងទៀតក្នុងរយៈពេល ១ នាទី។' 
        });
    }

    const { sheet, action } = req.query;

    try {
        // Handle getting list of sheet names
        if (action === 'list') {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${API_KEY}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch sheet names');
            }
            
            const data = await response.json();
            const sheets = data.sheets.map(s => s.properties.title);
            
            return res.status(200).json({ sheets });
        }

        // Handle getting sheet data
        if (!sheet) {
            return res.status(400).json({ error: 'Sheet name is required' });
        }

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheet)}?key=${API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch from Google Sheets');
        }
        
        const data = await response.json();
        
        // Set cache headers (5 minutes)
        res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
        
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching sheet data:', error);
        return res.status(500).json({ error: 'មិនអាចទាញយកទិន្នន័យបានទេ' });
    }

}
