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
  const bar = new ProgressBar('Fetching system information :percent [:bar]', {
    complete: '#',
    incomplete: ' ',
    width: 10,
    total: tasks.length
  });

  bar.tick(0); // Start progress bar at 0%

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

  // Construct output
  const output = [];
  const { CPU: cpu, GPU: gpu, Memory: memory, Storage: storage, OS: os } = results;

  output.push('\n===============================');
  output.push('       PC Specifications       ');
  output.push('===============================');
  if (cpu) {
    output.push(`CPU: ${cpu.manufacturer} ${cpu.brand} (${cpu.speed} GHz)`);
    output.push(`Cores: ${cpu.cores}`);
  }
  output.push('-------------------------------');
  output.push('GPU:');
  if (gpu && gpu.controllers) {
    gpu.controllers.forEach((controller, index) => {
      output.push(`  ${index + 1}. ${controller.model} (${controller.vram} MB)`);
    });
  }
  output.push('-------------------------------');
  if (memory) {
    output.push(`RAM: ${(memory.total / (1024 ** 3)).toFixed(2)} GB`);
  }
  output.push('-------------------------------');
  output.push('Storage:');
  if (storage) {
    storage.forEach((disk, index) => {
      output.push(`  ${index + 1}. ${disk.name} ${disk.type} (${(disk.size / (1024 ** 3)).toFixed(2)} GB)`);
    });
  }
  output.push('-------------------------------');
  if (os) {
    output.push(`OS: ${os.distro} ${os.release}`);
  }

  console.log(output.join('\n'));
}

displaySystemInfo();
