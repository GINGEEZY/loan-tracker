const fs = require('fs');

const isVercel = Boolean(process.env.VERCEL);

function fail(message) {
	console.error('Build failed:', message);
	process.exit(1);
}

function cleanEnv(value) {
	return String(value || '')
		.trim()
		.replace(/^['"]|['"]$/g, '');
}

function normalizeSupabaseUrl(raw) {
	let url = cleanEnv(raw);
	if (!url) return '';

	// Common copy-paste mistakes
	url = url.replace(/\/rest\/v1\/?$/i, '');
	url = url.replace(/\/+$/, '');
	if (url.startsWith('http://')) {
		url = 'https://' + url.slice('http://'.length);
	}
	if (!url.startsWith('https://')) {
		url = 'https://' + url.replace(/^\/+/, '');
	}

	try {
		const parsed = new URL(url);
		if (!parsed.hostname.endsWith('.supabase.co')) {
			return { error: 'hostname must end with .supabase.co (got: ' + parsed.hostname + ')' };
		}
		return { url: 'https://' + parsed.hostname };
	} catch {
		return { error: 'not a valid URL' };
	}
}

const urlResult = normalizeSupabaseUrl(process.env.SUPABASE_URL);
const anonKey = cleanEnv(process.env.SUPABASE_ANON_KEY);

if (isVercel && (!urlResult.url || !anonKey)) {
	if (urlResult.error) {
		fail('Invalid SUPABASE_URL: ' + urlResult.error);
	}
	fail('Set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel → Settings → Environment Variables, then redeploy.');
}

if (urlResult.error) {
	fail('Invalid SUPABASE_URL: ' + urlResult.error);
}

const config = { url: urlResult.url, anonKey };
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
	if (!config.url || !config.anonKey) {
		console.warn('WARNING: SUPABASE_URL or SUPABASE_ANON_KEY missing — local build only.');
	}
	process.exit(0);
} catch (err) {
	fail(err.message);
}
