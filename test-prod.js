const { spawn } = require('child_process');

console.log("Building...");
const build = spawn('npm', ['run', 'build'], { shell: true, stdio: 'inherit' });

build.on('close', (code) => {
  if (code !== 0) process.exit(code);
  
  console.log("\nStarting production server...");
  const server = spawn('npm', ['run', 'start'], { shell: true, stdio: 'inherit' });
  
  setTimeout(async () => {
    try {
      console.log('\n--- Fetching /admin/events/new ---');
      const res = await fetch('http://localhost:3000/admin/events/new');
      console.log('HTTP Status:', res.status);
      const text = await res.text();
      if(text.includes('Error')) {
          console.log(text.slice(0, 500));
      }
      server.kill();
      process.exit(res.status === 500 ? 1 : 0);
    } catch(e) {
      console.error(e);
      server.kill();
      process.exit(1);
    }
  }, 10000);
});
