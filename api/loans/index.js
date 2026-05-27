const { getSupabase } = require('../lib/supabase');
const { send, methodNotAllowed, cors } = require('../lib/http');
const { rowsToRecords, bodyToLoanRow, validateLoanRow, loanToClient } = require('../lib/records');

module.exports = async function handler(req, res) {
	if (cors(req, res)) return;

	try {
		const supabase = getSupabase();

		if (req.method === 'GET') {
			const { data: loans, error: loanErr } = await supabase
				.from('loans')
				.select('*')
				.order('created_at', { ascending: false });
			if (loanErr) throw loanErr;

			const { data: repayments, error: repErr } = await supabase.from('repayments').select('*');
			if (repErr) throw repErr;

			return send(res, 200, rowsToRecords(loans || [], repayments || []));
		}

		if (req.method === 'POST') {
			const row = bodyToLoanRow(req.body);
			const err = validateLoanRow(row);
			if (err) return send(res, 400, { error: err });

			const { data, error } = await supabase.from('loans').insert(row).select('*').single();
			if (error) throw error;

			return send(res, 201, loanToClient(data, []));
		}

		methodNotAllowed(res, ['GET', 'POST']);
	} catch (err) {
		send(res, 500, { error: err.message || 'Server error' });
	}
};
