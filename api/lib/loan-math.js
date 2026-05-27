const DAYS_PER_MONTH = 30;
const MONTHLY_RATE = 0.10;

function durationExact(startStr, endStr) {
	const start = new Date(startStr + 'T00:00:00');
	const end = new Date(endStr + 'T00:00:00');
	if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
		return { months: 0, days: 0, valid: false };
	}

	let months = 0;
	let cursor = new Date(start.getTime());

	while (true) {
		const nextMonth = new Date(cursor.getTime());
		nextMonth.setMonth(nextMonth.getMonth() + 1);
		if (nextMonth.getTime() <= end.getTime()) {
			months += 1;
			cursor = nextMonth;
		} else {
			break;
		}
	}

	const msPerDay = 24 * 60 * 60 * 1000;
	const days = Math.round((end.getTime() - cursor.getTime()) / msPerDay);
	return { months, days, valid: true };
}

function calcPayable(principal, startDate, endDate) {
	const p = Number(principal) || 0;
	const dur = durationExact(startDate, endDate);
	if (!dur.valid) return p;
	const interest = p * MONTHLY_RATE * dur.months + p * MONTHLY_RATE * (dur.days / DAYS_PER_MONTH);
	return p + interest;
}

module.exports = { calcPayable };
