export default async function handler(req, res) {
    const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
    const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch sheet names from Google Sheets');
        }
        
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching sheet names:', error);
        res.status(500).json({ error: 'មិនអាចទាញយកឈ្មោះស៊ីតបានទេ' });
    }
}
