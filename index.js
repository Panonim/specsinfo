const si = require('systeminformation');
const ProgressBar = require('progress');

// List of information functions to get
const tasks = [
  { name: 'CPU', fn: si.cpu },
  { name: 'GPU', fn: si.graphics },
  { name: 'Memory', fn: si.mem },
  { name: 'Storage', fn: si.diskLayout },
  { name: 'OS', fn: si.osInfo }
];

// Loading bar
async function displaySystemInfo() {
  const bar = new ProgressBar('Fetching system information :percent [:bar] :elapseds', {
    complete: '#',
    incomplete: ' ',
    width: 10,
    total: tasks.length
  });

  setImmediate(() => {
    bar.tick(0); //  progress bar starts at 0%
  });

  // Handle errors 
  const results = {};
  const promises = tasks.map(({ name, fn }) => {
    return fn()
      .then(data => {
        results[name] = data;
        bar.tick(); // Update the progress bar
      })
      .catch(error => {
        console.error(`Error fetching ${name} information:`, error);
        results[name] = null;
        bar.tick(); // Update the progress bar even if there's an error
      });
  });

  await Promise.all(promises); 

  // Print info
   console.log('\n===============================');
   console.log('       PC Specifications       ');
   console.log('===============================');
  const cpu = results.CPU;
  const gpu = results.GPU;
  const memory = results.Memory;
  const storage = results.Storage;
  const os = results.OS;

  console.log(`CPU: ${cpu.manufacturer} ${cpu.brand} (${cpu.speed} GHz)`);
  console.log(`Cores: ${cpu.cores}`);
  console.log('-------------------------------');
  console.log('GPU:');
  if (gpu && gpu.controllers) {
    gpu.controllers.forEach((controller, index) => {
      console.log(`  ${index + 1}. ${controller.model} (${controller.vram} MB)`);
    });
  }
  console.log('-------------------------------');
  console.log(`RAM: ${(memory.total / (1024 ** 3)).toFixed(2)} GB`);
  console.log('-------------------------------');
  console.log('Storage:');
  if (storage) {
    storage.forEach((disk, index) => {
      console.log(`  ${index + 1}. ${disk.name} ${disk.type} (${(disk.size / (1024 ** 3)).toFixed(2)} GB)`);
    });
  }
  console.log('-------------------------------');
  console.log(`OS: ${os.distro} ${os.release}`);
}

displaySystemInfo();
