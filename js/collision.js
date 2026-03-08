


const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

let isRunning = false;


function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);


document.getElementById('collideBtn').addEventListener('click', startCollision);
document.getElementById('resetBtn').addEventListener('click', resetSimulation);


['mass1', 'velocity1', 'mass2', 'velocity2'].forEach(id => {
    document.getElementById(id).addEventListener('input', (e) => {
        const displayId = id + 'Value';
        document.getElementById(displayId).textContent = e.target.value;
        updateMomentum();
    });
});

function updateMomentum() {
    const mass1 = parseFloat(document.getElementById('mass1').value);
    const velocity1 = parseFloat(document.getElementById('velocity1').value);
    const mass2 = parseFloat(document.getElementById('mass2').value);
    const velocity2 = parseFloat(document.getElementById('velocity2').value);
    
    const momentum = (mass1 * velocity1 + mass2 * velocity2).toFixed(2);
    document.getElementById('initialMomentum').textContent = momentum + ' kg·m/s';
}

function startCollision() {
    isRunning = true;
    animateCollision();
}

function animateCollision() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    
    ctx.fillStyle = '#daa520';
    ctx.fillRect(100, canvas.height / 2 - 25, 50, 50);
    ctx.fillRect(canvas.width - 150, canvas.height / 2 - 25, 50, 50);
    
    
    ctx.fillStyle = '#e0e0e0';
    ctx.font = '16px Arial';
    ctx.fillText('Object 1', 100, canvas.height / 2 + 50);
    ctx.fillText('Object 2', canvas.width - 150, canvas.height / 2 + 50);
    
    if (isRunning) {
        requestAnimationFrame(animateCollision);
    }
}

function resetSimulation() {
    isRunning = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#666';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Click "Collide" to start the simulation', canvas.width / 2, canvas.height / 2);
}


resetSimulation();
updateMomentum();
