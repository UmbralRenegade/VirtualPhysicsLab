


const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
let isRunning = false;
let angle1 = 0;
let angle2 = 0;
let angularVel1 = 0;
let angularVel2 = 0;


function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);


document.getElementById('startBtn').addEventListener('click', startSimulation);
document.getElementById('resetBtn').addEventListener('click', resetSimulation);


['length1', 'length2', 'angle1', 'angle2'].forEach(id => {
    document.getElementById(id).addEventListener('input', (e) => {
        const displayId = id + 'Value';
        document.getElementById(displayId).textContent = e.target.value;
    });
});

function startSimulation() {
    angle1 = parseFloat(document.getElementById('angle1').value) * Math.PI / 180;
    angle2 = parseFloat(document.getElementById('angle2').value) * Math.PI / 180;
    angularVel1 = 0;
    angularVel2 = 0;
    isRunning = true;
    animatePendulum();
}

function animatePendulum() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 3;
    
    const length1 = parseFloat(document.getElementById('length1').value) * 50;
    const length2 = parseFloat(document.getElementById('length2').value) * 50;
    
    
    const x1 = centerX + length1 * Math.sin(angle1);
    const y1 = centerY + length1 * Math.cos(angle1);
    
    const x2 = x1 + length2 * Math.sin(angle2);
    const y2 = y1 + length2 * Math.cos(angle2);
    
    
    const g = 9.8;
    const dt = 0.01;
    const m1 = 1;
    const m2 = 1;
    
    
    const a1 = (-g * (2 * m1 + m2) * Math.sin(angle1) - m2 * g * Math.sin(angle1 - 2 * angle2) 
               - 2 * Math.sin(angle1 - angle2) * m2 * (angularVel2 * angularVel2 * length2 + angularVel1 * angularVel1 * length1 * Math.cos(angle1 - angle2))) 
               / (length1 * (2 * m1 + m2 - m2 * Math.cos(2 * angle1 - 2 * angle2)));
    
    const a2 = (2 * Math.sin(angle1 - angle2) * (angularVel1 * angularVel1 * length1 * (m1 + m2) + g * (m1 + m2) * Math.cos(angle1) 
               + angularVel2 * angularVel2 * length2 * m2 * Math.cos(angle1 - angle2))) 
               / (length2 * (2 * m1 + m2 - m2 * Math.cos(2 * angle1 - 2 * angle2)));
    
    angularVel1 += a1 * dt;
    angularVel2 += a2 * dt;
    angularVel1 *= 0.9999; 
    angularVel2 *= 0.9999;
    
    angle1 += angularVel1 * dt;
    angle2 += angularVel2 * dt;
    
    
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(centerX - 5, centerY - 5, 10, 10);
    
    
    ctx.strokeStyle = '#daa520';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    
    ctx.fillStyle = '#daa520';
    ctx.fillRect(x1 - 8, y1 - 8, 16, 16);
    
    
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(x2 - 8, y2 - 8, 16, 16);
    
    
    const angle1Deg = Math.round(angle1 * 180 / Math.PI);
    const angle2Deg = Math.round(angle2 * 180 / Math.PI);
    document.getElementById('displayAngle1').textContent = angle1Deg + '°';
    document.getElementById('displayAngle2').textContent = angle2Deg + '°';
    
    if (isRunning) {
        requestAnimationFrame(animatePendulum);
    }
}

function resetSimulation() {
    isRunning = false;
    angle1 = parseFloat(document.getElementById('angle1').value) * Math.PI / 180;
    angle2 = parseFloat(document.getElementById('angle2').value) * Math.PI / 180;
    angularVel1 = 0;
    angularVel2 = 0;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#666';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Click "Start" to begin the chaotic motion', canvas.width / 2, canvas.height / 2);
}


resetSimulation();
