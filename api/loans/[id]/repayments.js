const { getSupabase } = require('../../lib/supabase');
const { send, methodNotAllowed, cors } = require('../../lib/http');
const { newId, repaymentToClient } = require('../../lib/records');
const { calcPayable } = require('../../lib/loan-math');

module.exports = async function handler(req, res) {
	if (cors(req, res)) return;

	const { id: loanId } = req.query;
	if (!loanId) return send(res, 400, { error: 'Loan id is required.' });

	if (req.method !== 'POST') {
		return methodNotAllowed(res, ['POST']);
	}

	try {
		const supabase = getSupabase();
		const body = req.body || {};
		const amount = Number(body.amount);
		const paymentDate = body.date;
		const note = String(body.note || '').trim() || null;

		if (!amount || amount <= 0) return send(res, 400, { error: 'Valid payment amount is required.' });
		if (!paymentDate) return send(res, 400, { error: 'Payment date is required.' });

		const { data: loan, error: loanErr } = await supabase
			.from('loans')
			.select('id, principal, start_date, end_date')
			.eq('id', loanId)
			.single();
		if (loanErr || !loan) return send(res, 404, { error: 'Loan not found.' });

		const { data: existing, error: sumErr } = await supabase
			.from('repayments')
			.select('amount')
			.eq('loan_id', loanId);
		if (sumErr) throw sumErr;

		const paid = (existing || []).reduce((s, r) => s + Number(r.amount), 0);
		const payable = calcPayable(loan.principal, loan.start_date, loan.end_date);
		const balance = payable - paid;

		if (amount > balance + 0.01) {
			return send(res, 400, {
				error: `Payment exceeds remaining balance (${balance.toFixed(2)}).`
			});
		}

		const row = {
			id: body.id || newId('pay'),
			loan_id: loanId,
			amount,
			payment_date: paymentDate,
			note
		};

		const { data, error } = await supabase.from('repayments').insert(row).select('*').single();
		if (error) throw error;

		return send(res, 201, repaymentToClient(data));
	} catch (err) {
		send(res, 500, { error: err.message || 'Server error' });
	}
};
