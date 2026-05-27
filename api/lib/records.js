function newId(prefix) {
	return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function repaymentToClient(row) {
	return {
		id: row.id,
		amount: Number(row.amount),
		date: row.payment_date,
		note: row.note || ''
	};
}

function loanToClient(loan, repayments) {
	return {
		id: loan.id,
		name: loan.name,
		phone: loan.phone || '',
		principal: Number(loan.principal),
		startDate: loan.start_date,
		endDate: loan.end_date,
		notes: loan.notes || '',
		createdAt: loan.created_at,
		repayments: (repayments || []).map(repaymentToClient)
	};
}

function rowsToRecords(loans, repayments) {
	const byLoan = {};
	for (const r of repayments || []) {
		if (!byLoan[r.loan_id]) byLoan[r.loan_id] = [];
		byLoan[r.loan_id].push(r);
	}
	return (loans || []).map((loan) => loanToClient(loan, byLoan[loan.id] || []));
}

function bodyToLoanRow(body, id) {
	return {
		id: id || body.id || newId('loan'),
		name: String(body.name || '').trim(),
		phone: String(body.phone || '').trim() || null,
		principal: Number(body.principal),
		start_date: body.startDate,
		end_date: body.endDate,
		notes: String(body.notes || '').trim() || null
	};
}

function validateLoanRow(row) {
	if (!row.name) return 'Borrower name is required.';
	if (!row.principal || row.principal <= 0) return 'Principal must be greater than zero.';
	if (!row.start_date || !row.end_date) return 'Start and end dates are required.';
	if (row.end_date < row.start_date) return 'End date cannot be before start date.';
	return null;
}

module.exports = {
	newId,
	loanToClient,
	rowsToRecords,
	bodyToLoanRow,
	validateLoanRow,
	repaymentToClient
};
