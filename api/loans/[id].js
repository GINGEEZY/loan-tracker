const { getSupabase } = require('../lib/supabase');
const { send, methodNotAllowed, cors } = require('../lib/http');
const { bodyToLoanRow, validateLoanRow, loanToClient } = require('../lib/records');

module.exports = async function handler(req, res) {
	if (cors(req, res)) return;

	const { id } = req.query;
	if (!id) return send(res, 400, { error: 'Loan id is required.' });

	try {
		const supabase = getSupabase();

		if (req.method === 'PUT') {
			const row = bodyToLoanRow(req.body, id);
			const err = validateLoanRow(row);
			if (err) return send(res, 400, { error: err });

			const { data, error } = await supabase
				.from('loans')
				.update({
					name: row.name,
					phone: row.phone,
					principal: row.principal,
					start_date: row.start_date,
					end_date: row.end_date,
					notes: row.notes
				})
				.eq('id', id)
				.select('*')
				.single();
			if (error) throw error;
			if (!data) return send(res, 404, { error: 'Loan not found.' });

			const { data: reps } = await supabase.from('repayments').select('*').eq('loan_id', id);
			return send(res, 200, loanToClient(data, reps || []));
		}

		if (req.method === 'DELETE') {
			const { error } = await supabase.from('loans').delete().eq('id', id);
			if (error) throw error;
			return send(res, 200, { ok: true });
		}

		methodNotAllowed(res, ['PUT', 'DELETE']);
	} catch (err) {
		send(res, 500, { error: err.message || 'Server error' });
	}
};
