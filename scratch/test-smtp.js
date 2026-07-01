const fs = require('fs');
const path = require('path');
const tls = require('tls');

// Parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env.local file not found in project root.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.\-_]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
});

const host = env.SMTP_HOST || 'smtp.hostinger.com';
const port = parseInt(env.SMTP_PORT || '465', 10);
const user = env.SMTP_USER || '';
const pass = env.SMTP_PASS || '';

if (!user || !pass) {
  console.error('❌ Error: SMTP_USER or SMTP_PASS not found in .env.local.');
  process.exit(1);
}

console.log(`📡 Connecting to ${host}:${port} as ${user}...`);

const socket = tls.connect({ host, port, rejectUnauthorized: false }, () => {
  console.log('📶 TLS Connection Established. Handshaking...');
});

let step = 0;
socket.setEncoding('utf8');
socket.on('data', (data) => {
  console.log(`📥 Server: ${data.trim()}`);
  
  if (data.startsWith('220') && step === 0) {
    send('EHLO verotides.com');
    step = 1;
  } else if (step === 1) {
    send('AUTH LOGIN');
    step = 2;
  } else if (step === 2 && data.startsWith('334')) {
    send(Buffer.from(user).toString('base64'));
    step = 3;
  } else if (step === 3 && data.startsWith('334')) {
    send(Buffer.from(pass).toString('base64'));
    step = 4;
  } else if (step === 4) {
    if (data.startsWith('235')) {
      console.log('✅ Success: SMTP Authentication successful!');
      // Test sending from alias
      send(`MAIL FROM:<hello@verotides.com>`);
      step = 5;
    } else {
      console.error('❌ Error: SMTP Authentication failed.');
      send('QUIT');
      step = 9;
    }
  } else if (step === 5 && data.startsWith('250')) {
    send(`RCPT TO:<${user}>`);
    step = 6;
  } else if (step === 6 && data.startsWith('250')) {
    send('DATA');
    step = 7;
  } else if (step === 7 && data.startsWith('354')) {
    socket.write(`Subject: Verotides SMTP Alias Verification\r\nFrom: hello@verotides.com\r\nTo: ${user}\r\n\r\nThis is a diagnostic mail confirming Hostinger permits sending from aliases under the catch-all setup.\r\n.\r\n`);
    console.log('📤 Client: [Sending Mail Data]');
    step = 8;
  } else if (step === 8 && data.startsWith('250')) {
    console.log('✅ Success: Server accepted the mail from alias hello@verotides.com!');
    send('QUIT');
    step = 9;
  } else if (step === 9) {
    socket.end();
  }
});

socket.on('error', (err) => {
  console.error('❌ Connection Error:', err.message);
});

function send(cmd) {
  console.log(`📤 Client: ${cmd}`);
  socket.write(cmd + '\r\n');
}
