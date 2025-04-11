const { API_KEY } = require('./core/auth.json')
module.exports = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || apiKey !== API_KEY) {
        return res.status(403).json({ message: 'Forbidden: Invalid or missing API key' });
    }

    next();
};
