const { spawn } = require('child_process');
const server = spawn('npm', ['run', 'dev'], { shell: true, stdio: 'pipe' });

server.stdout.on('data', d => process.stdout.write(d));
server.stderr.on('data', d => process.stderr.write(d));

setTimeout(async () => {
  try {
    console.log('\n--- Fetching /admin/events/new ---');
    const res = await fetch('http://localhost:3000/admin/events/new');
    console.log('HTTP Status:', res.status);
    server.kill();
    process.exit(res.status === 500 ? 1 : 0);
  } catch(e) {
    console.error(e);
    server.kill();
    process.exit(1);
  }
}, 30000);
