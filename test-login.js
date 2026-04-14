const https = require('https');
const data = JSON.stringify({ email: 'prakharkumarcse@gmail.com', password: '12345678' });

const req = https.request('https://group-project-expense-tracker.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Origin': 'https://group-project-expense-tracker.vercel.app'
  }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log(res.statusCode, body));
});
req.on('error', console.error);
req.write(data);
req.end();
