
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  try {
    const response = await fetch("https://hooks.zapier.com/hooks/catch/22888199/2nnqy50/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Zapier error', detail: await response.text() });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error', detail: error.message });
  }
}
