// © 2024 Artur Flis, All rights saved

const { exec } = require('child_process');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask a question with a default value
function askQuestion(query, defaultValue) {
  return new Promise(resolve => {
    rl.question(`${query} [${defaultValue}]: `, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

// Function to run benchmark on a single script
function runBenchmark(scriptName, numRuns) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, scriptName);
    let durations = [];
    let completedRuns = 0;

    function runNext(runNumber) {
      if (runNumber > numRuns) {
        const totalDuration = durations.reduce((acc, duration) => acc + duration, 0);
        const averageDuration = totalDuration / durations.length;
        resolve({ scriptName, averageDuration });
        return;
      }

      const startTime = process.hrtime();
      exec(`node ${scriptPath}`, (error) => {
        if (error) {
          reject(`Error running ${scriptName}: ${error.message}`);
          return;
        }
        const endTime = process.hrtime(startTime);
        const duration = endTime[0] + endTime[1] / 1e9; // Convert to seconds
        durations.push(duration);
        completedRuns++;
        
        // Print progress
        console.log(`Running ${scriptName}: ${completedRuns}/${numRuns} completed`);

        runNext(runNumber + 1);
      });
    }

    runNext(1);
  });
}

// Function to wait for the user to press Enter
function waitForExit() {
  return new Promise(resolve => {
    rl.question('Press Enter to exit...', () => {
      resolve();
    });
  });
}

async function main() {
  try {
    // Ask user for the number of runs with default value of 100
    const numRuns = parseInt(await askQuestion('Enter the number of tests', '100'), 10);
    if (isNaN(numRuns) || numRuns <= 0) {
      console.log('Invalid number of tests. Exiting.');
      rl.close();
      return;
    }

    // Ask user for the file names
    const scriptsInput = await askQuestion('Enter the script names separated by commas', '');
    const scriptNames = scriptsInput.split(',').map(name => name.trim());

    if (scriptNames.length === 0) {
      console.log('No scripts provided. Exiting.');
      rl.close();
      return;
    }

    // Run benchmark and collect results
    const results = [];
    for (const scriptName of scriptNames) {
      console.log(`Starting benchmark for ${scriptName}...`);
      const result = await runBenchmark(scriptName, numRuns);
      results.push(result);
    }

    // Print results
    console.log('\nBenchmark Results:');
    results.forEach(({ scriptName, averageDuration }) => {
      console.log(`Average execution time for ${scriptName}: ${averageDuration} seconds`);
    });

    // Wait for user to press Enter before exiting
    await waitForExit();
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    rl.close();
  }
}

main();
