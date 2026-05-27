const fs = require('fs');

const url = process.env.SUPABASE_URL || '';
const anonKey = process.env.SUPABASE_ANON_KEY || '';
const config = { url, anonKey };

if (!url || !anonKey) {
	console.warn('Warning: SUPABASE_URL or SUPABASE_ANON_KEY missing — config.js will be empty.');
}

fs.writeFileSync(
	'config.js',
	'window.SUPABASE_CONFIG = ' + JSON.stringify(config, null, 2) + ';\n',
	'utf8'
);
console.log('Wrote config.js for Supabase URL:', url || '(not set)');
