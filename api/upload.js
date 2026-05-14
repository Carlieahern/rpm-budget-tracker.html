export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) {
    res.status(401).json({ error: 'Missing Authorization header' });
    return;
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);

    const mondayRes = await fetch('https://api.monday.com/v2/file', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': req.headers['content-type'],
        'API-Version': '2024-01',
      },
      body: body,
    });

    const data = await mondayRes.json();
    res.status(mondayRes.status).json(data);
  } catch (error) {
    console.error('Upload proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}
