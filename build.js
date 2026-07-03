const fs = require('fs');

const url = (process.env.SUPABASE_URL || '').trim();
const anonKey = (process.env.SUPABASE_ANON_KEY || '').trim();
const isVercel = Boolean(process.env.VERCEL);

function fail(message) {
	console.error('Build failed:', message);
	process.exit(1);
}

if (isVercel && (!url || !anonKey)) {
	fail('Set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables, then redeploy.');
}

if (url && !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)) {
	fail(
		'SUPABASE_URL must look like https://YOUR_PROJECT.supabase.co (no /rest/v1 path, no Vercel URL).'
	);
}

const config = { url: url.replace(/\/$/, ''), anonKey };
const configJs = 'window.SUPABASE_CONFIG = ' + JSON.stringify(config, null, 2) + ';\n';

try {
	fs.writeFileSync('config.js', configJs, 'utf8');

	const indexPath = 'index.html';
	let html = fs.readFileSync(indexPath, 'utf8');
	const inlineScript = '<script>\n' + configJs.trim() + '\n</script>';
	const replaced = html.replace('<script src="config.js"></script>', inlineScript);

	if (replaced === html) {
		fail('index.html is missing <script src="config.js"></script> — cannot inject Supabase config.');
	}

	fs.writeFileSync(indexPath, replaced, 'utf8');
	console.log('Build OK — injected Supabase config into index.html');
	if (!url || !anonKey) {
		console.warn('WARNING: SUPABASE_URL or SUPABASE_ANON_KEY missing — local build only.');
	}
	process.exit(0);
} catch (err) {
	fail(err.message);
}
