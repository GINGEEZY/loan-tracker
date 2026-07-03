const fs = require('fs');

const url = process.env.SUPABASE_URL || '';
const anonKey = process.env.SUPABASE_ANON_KEY || '';

try {
	const config = { url, anonKey };
	if (!url || !anonKey) {
		console.warn('WARNING: Set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel Environment Variables.');
	}
	fs.writeFileSync(
		'config.js',
		'window.SUPABASE_CONFIG = ' + JSON.stringify(config, null, 2) + ';\n',
		'utf8'
	);
	console.log('Build OK — wrote config.js');
	process.exit(0);
} catch (err) {
	console.error('Build failed:', err.message);
	process.exit(1);
}
