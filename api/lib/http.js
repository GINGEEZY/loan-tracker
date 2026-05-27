function send(res, status, body) {
	res.status(status).json(body);
}

function methodNotAllowed(res, allowed) {
	res.setHeader('Allow', allowed.join(', '));
	send(res, 405, { error: 'Method not allowed' });
}

function cors(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	if (req.method === 'OPTIONS') {
		res.status(204).end();
		return true;
	}
	return false;
}

module.exports = { send, methodNotAllowed, cors };
