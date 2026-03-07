const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 900;
canvas.height = 600;

const scale = 5;

let isAnimating = false;
let animationId = null;
let projectile = null;
let trajectoryPoints = [];

const velocitySlider = document.getElementById('velocity');
const angleSlider = document.getElementById('angle');
const gravitySlider = document.getElementById('gravity');
const velocityValue = document.getElementById('velocityValue');
const angleValue = document.getElementById('angleValue');
const gravityValue = document.getElementById('gravityValue');
const launchBtn = document.getElementById('launchBtn');
const resetBtn = document.getElementById('resetBtn');
const showTrajectoryCheckbox = document.getElementById('showTrajectory');
const showVectorsCheckbox = document.getElementById('showVectors');

const maxHeightDisplay = document.getElementById('maxHeight');
const rangeDisplay = document.getElementById('range');
const flightTimeDisplay = document.getElementById('flightTime');
const currentHeightDisplay = document.getElementById('currentHeight');

velocitySlider.addEventListener('input', (e) => {
    velocityValue.textContent = e.target.value;
    calculateTrajectory();
});

angleSlider.addEventListener('input', (e) => {
    angleValue.textContent = e.target.value;
    calculateTrajectory();
});

gravitySlider.addEventListener('input', (e) => {
    gravityValue.textContent = e.target.value;
    calculateTrajectory();
});

class Projectile {
    constructor(v0, angle, g) {
        this.v0 = v0;
        this.angle = angle * Math.PI / 180; 
        this.g = g;

        this.vx = v0 * Math.cos(this.angle);
        this.vy = v0 * Math.sin(this.angle);

        this.x = 50;
        this.y = canvas.height - 50;
        this.initialY = this.y;

        this.t = 0;

        this.maxHeight = (this.vy ** 2) / (2 * this.g);
        this.timeToMaxHeight = this.vy / this.g;
        this.totalTime = (2 * this.vy) / this.g;
        this.range = (v0 ** 2 * Math.sin(2 * this.angle)) / this.g;
    }
    
    update(dt) {
        this.t += dt;
        this.x = 50 + this.vx * this.t * scale;
        this.y = this.initialY - (this.vy * this.t - 0.5 * this.g * this.t ** 2) * scale;
        this.currentVy = this.vy - this.g * this.t;
        this.currentVx = this.vx;

        if (this.y >= this.initialY) {
            this.y = this.initialY;
            return false; 
        }
        return true; 
    }
    
    getCurrentHeight() {
        return (this.initialY - this.y) / scale;
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#daa520';
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#daa520';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#daa520';
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    drawVelocityVectors() {
        if (!showVectorsCheckbox.checked) return;
        const vectorScale = 2;

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.currentVx * vectorScale, this.y);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();

        this.drawArrowhead(this.x + this.currentVx * vectorScale, this.y, 0, '#ffd700');

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y - this.currentVy * vectorScale);
        ctx.strokeStyle = '#ff6347';
        ctx.lineWidth = 2;
        ctx.stroke();

        this.drawArrowhead(this.x, this.y - this.currentVy * vectorScale, -Math.PI/2, '#ff6347');

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.currentVx * vectorScale, this.y - this.currentVy * vectorScale);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        const angle = Math.atan2(-this.currentVy, this.currentVx);
        this.drawArrowhead(
            this.x + this.currentVx * vectorScale,
            this.y - this.currentVy * vectorScale,
            angle,
            '#ffffff'
        );
    }
    
    drawArrowhead(x, y, angle, color) {
        const headLength = 10;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
            x - headLength * Math.cos(angle - Math.PI / 6),
            y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            x - headLength * Math.cos(angle + Math.PI / 6),
            y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
    }
}

function calculateTrajectory() {
    if (isAnimating) return;
    
    const v0 = parseFloat(velocitySlider.value);
    const angle = parseFloat(angleSlider.value) * Math.PI / 180;
    const g = parseFloat(gravitySlider.value);

    trajectoryPoints = [];
    const vx = v0 * Math.cos(angle);
    const vy = v0 * Math.sin(angle);
    const totalTime = (2 * vy) / g;
    const steps = 100;
    
    for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * totalTime;
        const x = 50 + vx * t * scale;
        const y = (canvas.height - 50) - (vy * t - 0.5 * g * t ** 2) * scale;
        trajectoryPoints.push({ x, y });
    }

    const maxHeight = (vy ** 2) / (2 * g);
    const range = (v0 ** 2 * Math.sin(2 * angle)) / g;
    const flightTime = totalTime;
    
    maxHeightDisplay.textContent = maxHeight.toFixed(2) + ' m';
    rangeDisplay.textContent = range.toFixed(2) + ' m';
    flightTimeDisplay.textContent = flightTime.toFixed(2) + ' s';
    drawScene();
}

function drawScene() {
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawGround();

    if (showTrajectoryCheckbox.checked && trajectoryPoints.length > 0) {
        ctx.beginPath();
        ctx.moveTo(trajectoryPoints[0].x, trajectoryPoints[0].y);
        for (let i = 1; i < trajectoryPoints.length; i++) {
            ctx.lineTo(trajectoryPoints[i].x, trajectoryPoints[i].y);
        }
        ctx.strokeStyle = 'rgba(218, 165, 32, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    if (projectile) {
        projectile.draw();
        projectile.drawVelocityVectors();
        currentHeightDisplay.textContent = projectile.getCurrentHeight().toFixed(2) + ' m';
    }
    drawLaunchAngle();
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(218, 165, 32, 0.1)';
    ctx.lineWidth = 1;
 
    for (let x = 50; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawGround() {
    const groundY = canvas.height - 50;

    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.strokeStyle = '#daa520';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = 'rgba(218, 165, 32, 0.1)';
    ctx.fillRect(0, groundY, canvas.width, 50);
}

function drawLaunchAngle() {
    const startX = 50;
    const startY = canvas.height - 50;
    const angle = parseFloat(angleSlider.value) * Math.PI / 180;
    const radius = 40;

    ctx.beginPath();
    ctx.arc(startX, startY, radius, -angle, 0, false);
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + radius * Math.cos(-angle), startY + radius * Math.sin(-angle));
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffd700';
    ctx.font = '14px Segoe UI';
    ctx.fillText(
        angleSlider.value + '°',
        startX + (radius + 15) * Math.cos(-angle / 2),
        startY + (radius + 15) * Math.sin(-angle / 2)
    );
}

function animate() {
    const dt = 0.016; 
    if (projectile) {
        const shouldContinue = projectile.update(dt);
        drawScene();
        
        if (shouldContinue) {
            animationId = requestAnimationFrame(animate);
        } else {
            isAnimating = false;
            launchBtn.textContent = 'Launch';
            currentHeightDisplay.textContent = '0.00 m';
        }
    }
}

launchBtn.addEventListener('click', () => {
    if (isAnimating) {
        isAnimating = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        launchBtn.textContent = 'Launch';
        projectile = null;
        drawScene();
    } else {
        const v0 = parseFloat(velocitySlider.value);
        const angle = parseFloat(angleSlider.value);
        const g = parseFloat(gravitySlider.value);
        
        projectile = new Projectile(v0, angle, g);
        isAnimating = true;
        launchBtn.textContent = 'Stop';
        animate();
    }
});


resetBtn.addEventListener('click', () => {
    isAnimating = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    projectile = null;

    velocitySlider.value = 50;
    angleSlider.value = 45;
    gravitySlider.value = 9.8;
    
    velocityValue.textContent = '50';
    angleValue.textContent = '45';
    gravityValue.textContent = '9.8';
    launchBtn.textContent = 'Launch';
    currentHeightDisplay.textContent = '0.00 m';
    calculateTrajectory();
});

showTrajectoryCheckbox.addEventListener('change', drawScene);
showVectorsCheckbox.addEventListener('change', drawScene);

calculateTrajectory();
