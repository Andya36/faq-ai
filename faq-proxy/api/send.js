export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Restrict to POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Only POST requests allowed' });
    }

    // Validate request body (example schema)
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: 'Invalid request body', detail: error.details });
    }

    // Fetch Zapier webhook
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5 seconds

        const response = await fetch(process.env.ZAPIER_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
            signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Zapier error', detail: await response.text() });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        if (error.name === 'AbortError') {
            return res.status(504).json({ error: 'Request timeout' });
        }
        res.status(500).json({ error: 'Server error', detail: 'An unexpected error occurred' });
    }
}
