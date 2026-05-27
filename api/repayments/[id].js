const { getSupabase } = require('../../lib/supabase');
const { send, methodNotAllowed, cors } = require('../../lib/http');

module.exports = async function handler(req, res) {
	if (cors(req, res)) return;

	const { id } = req.query;
	if (!id) return send(res, 400, { error: 'Repayment id is required.' });

	if (req.method !== 'DELETE') {
		return methodNotAllowed(res, ['DELETE']);
	}

	try {
		const supabase = getSupabase();
		const { error } = await supabase.from('repayments').delete().eq('id', id);
		if (error) throw error;
		return send(res, 200, { ok: true });
	} catch (err) {
		send(res, 500, { error: err.message || 'Server error' });
	}
};
