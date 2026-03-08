


const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

let isRunning = false;
let time = 0;


function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);


document.getElementById('startBtn').addEventListener('click', startSimulation);
document.getElementById('resetBtn').addEventListener('click', resetSimulation);


['mass', 'springConstant', 'displacement', 'friction'].forEach(id => {
    document.getElementById(id).addEventListener('input', (e) => {
        const displayId = id + 'Value';
        document.getElementById(displayId).textContent = e.target.value;
        updateCalculations();
    });
});

function updateCalculations() {
    const mass = parseFloat(document.getElementById('mass').value);
    const k = parseFloat(document.getElementById('springConstant').value);
    
    
    const omega = Math.sqrt(k / mass);
    const frequency = omega / (2 * Math.PI);
    const period = 1 / frequency;
    
    document.getElementById('frequency').textContent = frequency.toFixed(2);
    document.getElementById('period').textContent = period.toFixed(2);
}

function startSimulation() {
    isRunning = true;
    time = 0;
    animateSystem();
}

function animateSystem() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const displacement = parseFloat(document.getElementById('displacement').value);
    const mass = parseFloat(document.getElementById('mass').value);
    const k = parseFloat(document.getElementById('springConstant').value);
    
    
    const omega = Math.sqrt(k / mass);
    const x = displacement * Math.cos(omega * time);
    
    
    ctx.strokeStyle = '#daa520';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, centerY);
    ctx.lineTo(centerX + x * 50, centerY);
    ctx.stroke();
    
    
    ctx.fillStyle = '#daa520';
    ctx.fillRect(centerX + x * 50 - 15, centerY - 15, 30, 30);
    
    
    ctx.strokeStyle = '#666';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(100, centerY);
    ctx.lineTo(canvas.width - 100, centerY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    
    const currentEnergy = 0.5 * k * x * x;
    document.getElementById('currentPosition').textContent = x.toFixed(2) + ' m';
    document.getElementById('currentEnergy').textContent = currentEnergy.toFixed(2) + ' J';
    
    time += 0.016; 
    
    if (isRunning) {
        requestAnimationFrame(animateSystem);
    }
}

function resetSimulation() {
    isRunning = false;
    time = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#666';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Click "Start" to begin the simulation', canvas.width / 2, canvas.height / 2);
}


resetSimulation();
updateCalculations();
