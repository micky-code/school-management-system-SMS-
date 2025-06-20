const { spawn } = require('child_process');
const path = require('path');

console.log('Starting setup and migration process...');

// Function to run scripts sequentially
const runScript = (scriptPath) => {
  return new Promise((resolve, reject) => {
    console.log(`Running ${path.basename(scriptPath)}...`);
    
    const process = spawn('node', [scriptPath], {
      stdio: 'inherit'
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`${path.basename(scriptPath)} completed successfully.`);
        resolve();
      } else {
        console.error(`${path.basename(scriptPath)} failed with code ${code}.`);
        reject(new Error(`Script exited with code ${code}`));
      }
    });
  });
};

// Define the scripts to run in order
const scripts = [
  path.join(__dirname, 'setup-login-tables.js'),
  path.join(__dirname, 'migrate-to-username.js')
];

// Run the scripts sequentially
(async () => {
  try {
    for (const script of scripts) {
      await runScript(script);
    }
    console.log('Setup and migration completed successfully!');
  } catch (error) {
    console.error('Setup and migration failed:', error);
    process.exit(1);
  }
})();
