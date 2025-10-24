// api/sheets.js
export default async function handler(req, res) {
    const { sheet } = req.query;
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
    const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

    try {
        console.log('Fetching sheet data for:', sheet);
        
        if (!sheet) {
            return res.status(400).json({ error: 'Sheet name is required' });
        }

        if (!API_KEY || !SPREADSHEET_ID) {
            throw new Error('API key or Spreadsheet ID not configured');
        }

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheet}?key=${API_KEY}`;
        console.log('API URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Sheet data fetched successfully');
        res.status(200).json(data);
    } catch (error) {
        console.error('Error in sheets API:', error);
        res.status(500).json({ 
            error: 'មិនអាចទាញយកទិន្នន័យបានទេ',
            details: error.message 
        });
    }
}
