
// Momentum Conservation in Collision Simulation

const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

let isRunning = false;
let time = 0;
let object1Pos = 100;
let object2Pos = 0;
let object1Vel = 0;
let object2Vel = 0;
let collisionOccurred = false;

// Initialize canvas
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    object2Pos = canvas.width - 150;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Event listeners
document.getElementById('collideBtn').addEventListener('click', startCollision);
document.getElementById('resetBtn').addEventListener('click', resetSimulation);

// Update displays when user changes values
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
    time = 0;
    collisionOccurred = false;
    object1Pos = 100;
    object2Pos = canvas.width - 150;
    
    const mass1 = parseFloat(document.getElementById('mass1').value);
    const velocity1 = parseFloat(document.getElementById('velocity1').value);
    const mass2 = parseFloat(document.getElementById('mass2').value);
    const velocity2 = parseFloat(document.getElementById('velocity2').value);
    
    object1Vel = velocity1 * 2;
    object2Vel = velocity2 * 2;
    
    const isElastic = document.getElementById('elasticCollision').checked;
    
    animateCollision(mass1, mass2, isElastic);
}

function animateCollision(mass1, mass2, isElastic) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerY = canvas.height / 2;
    const objWidth = 50;
    const objHeight = 50;
    
    // Update positions
    object1Pos += object1Vel * 0.8;
    object2Pos += object2Vel * 0.8;
    
    // Check for collision
    if (!collisionOccurred && object1Pos + objWidth >= object2Pos) {
        collisionOccurred = true;
        
        // Calculate final velocities based on elastic or inelastic
        const m1 = mass1;
        const m2 = mass2;
        const v1i = object1Vel;
        const v2i = object2Vel;
        
        if (isElastic) {
            // Elastic collision formulas
            object1Vel = ((m1 - m2) * v1i + 2 * m2 * v2i) / (m1 + m2);
            object2Vel = ((m2 - m1) * v2i + 2 * m1 * v1i) / (m1 + m2);
        } else {
            // Inelastic collision - stick together
            const finalVel = (m1 * v1i + m2 * v2i) / (m1 + m2);
            object1Vel = finalVel;
            object2Vel = finalVel;
        }
        
        // Calculate energy loss
        const initialKE = 0.5 * m1 * v1i * v1i + 0.5 * m2 * v2i * v2i;
        const finalKE = 0.5 * m1 * object1Vel * object1Vel + 0.5 * m2 * object2Vel * object2Vel;
        const energyLoss = ((initialKE - finalKE) / initialKE * 100).toFixed(1);
        document.getElementById('energyLoss').textContent = energyLoss + ' %';
        
        // Calculate final momentum
        const finalMomentum = (m1 * object1Vel + m2 * object2Vel).toFixed(2);
        document.getElementById('finalMomentum').textContent = finalMomentum + ' kg·m/s';
    }
    
    // Draw objects
    ctx.fillStyle = '#daa520';
    ctx.fillRect(object1Pos, centerY - objHeight / 2, objWidth, objHeight);
    
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(object2Pos, centerY - objHeight / 2, objWidth, objHeight);
    
    // Draw labels
    ctx.fillStyle = '#e0e0e0';
    ctx.font = '14px Arial';
    ctx.fillText('Obj 1', object1Pos + 5, centerY + 40);
    ctx.fillText('Obj 2', object2Pos + 5, centerY + 40);
    
    // Draw velocity vectors if enabled
    if (document.getElementById('showVectors').checked) {
        // Vector for object 1
        ctx.strokeStyle = '#daa520';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(object1Pos + objWidth / 2, centerY);
        ctx.lineTo(object1Pos + objWidth / 2 + object1Vel * 3, centerY);
        ctx.stroke();
        
        // Vector for object 2
        ctx.strokeStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(object2Pos + objWidth / 2, centerY);
        ctx.lineTo(object2Pos + objWidth / 2 + object2Vel * 3, centerY);
        ctx.stroke();
    }
    
    // Continue animation while objects are moving
    if (isRunning && (Math.abs(object1Vel) > 0.1 || Math.abs(object2Vel) > 0.1)) {
        requestAnimationFrame(() => animateCollision(mass1, mass2, isElastic));
    }
}

function resetSimulation() {
    isRunning = false;
    time = 0;
    collisionOccurred = false;
    object1Pos = 100;
    object2Pos = canvas.width - 150;
    object1Vel = 0;
    object2Vel = 0;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#666';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Click "Collide" to start the simulation', canvas.width / 2, canvas.height / 2);
    
    document.getElementById('finalMomentum').textContent = '0.00 kg·m/s';
    document.getElementById('energyLoss').textContent = '0.00 %';
}

// Initial draw
resetSimulation();
updateMomentum();

