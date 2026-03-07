// Canvas setup
const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 900;
canvas.height = 600;

// Scale factor for visualization (pixels per meter)
const scale = 5;

// Simulation state
let isAnimating = false;
let animationId = null;
let projectile = null;
let trajectoryPoints = [];

// Get DOM elements
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

// Info displays
const maxHeightDisplay = document.getElementById('maxHeight');
const rangeDisplay = document.getElementById('range');
const flightTimeDisplay = document.getElementById('flightTime');
const currentHeightDisplay = document.getElementById('currentHeight');

// Update value displays
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

// Projectile class
class Projectile {
    constructor(v0, angle, g) {
        this.v0 = v0;
        this.angle = angle * Math.PI / 180; // Convert to radians
        this.g = g;
        
        // Calculate initial velocity components
        this.vx = v0 * Math.cos(this.angle);
        this.vy = v0 * Math.sin(this.angle);
        
        // Initial position (starting from bottom left with margin)
        this.x = 50;
        this.y = canvas.height - 50;
        this.initialY = this.y;
        
        // Time
        this.t = 0;
        
        // Calculate trajectory properties
        this.maxHeight = (this.vy ** 2) / (2 * this.g);
        this.timeToMaxHeight = this.vy / this.g;
        this.totalTime = (2 * this.vy) / this.g;
        this.range = (v0 ** 2 * Math.sin(2 * this.angle)) / this.g;
    }
    
    update(dt) {
        this.t += dt;
        
        // Kinematic equations
        this.x = 50 + this.vx * this.t * scale;
        this.y = this.initialY - (this.vy * this.t - 0.5 * this.g * this.t ** 2) * scale;
        
        // Current velocity components
        this.currentVy = this.vy - this.g * this.t;
        this.currentVx = this.vx;
        
        // Check if projectile has landed
        if (this.y >= this.initialY) {
            this.y = this.initialY;
            return false; // Animation should stop
        }
        
        return true; // Continue animation
    }
    
    getCurrentHeight() {
        return (this.initialY - this.y) / scale;
    }
    
    draw() {
        // Draw the projectile
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#daa520';
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add glow effect
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
        
        // Horizontal velocity vector (gold)
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.currentVx * vectorScale, this.y);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw arrowhead for horizontal
        this.drawArrowhead(this.x + this.currentVx * vectorScale, this.y, 0, '#ffd700');
        
        // Vertical velocity vector (red-gold)
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y - this.currentVy * vectorScale);
        ctx.strokeStyle = '#ff6347';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw arrowhead for vertical
        this.drawArrowhead(this.x, this.y - this.currentVy * vectorScale, -Math.PI/2, '#ff6347');
        
        // Resultant velocity vector (white)
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.currentVx * vectorScale, this.y - this.currentVy * vectorScale);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw arrowhead for resultant
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

// Calculate and draw theoretical trajectory
function calculateTrajectory() {
    if (isAnimating) return;
    
    const v0 = parseFloat(velocitySlider.value);
    const angle = parseFloat(angleSlider.value) * Math.PI / 180;
    const g = parseFloat(gravitySlider.value);
    
    // Calculate trajectory points
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
    
    // Update calculated values
    const maxHeight = (vy ** 2) / (2 * g);
    const range = (v0 ** 2 * Math.sin(2 * angle)) / g;
    const flightTime = totalTime;
    
    maxHeightDisplay.textContent = maxHeight.toFixed(2) + ' m';
    rangeDisplay.textContent = range.toFixed(2) + ' m';
    flightTimeDisplay.textContent = flightTime.toFixed(2) + ' s';
    
    drawScene();
}

// Draw the scene
function drawScene() {
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid();
    
    // Draw ground
    drawGround();
    
    // Draw theoretical trajectory
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
    
    // Draw projectile if it exists
    if (projectile) {
        projectile.draw();
        projectile.drawVelocityVectors();
        
        // Update current height display
        currentHeightDisplay.textContent = projectile.getCurrentHeight().toFixed(2) + ' m';
    }
    
    // Draw launch angle indicator
    drawLaunchAngle();
}

// Draw grid
function drawGrid() {
    ctx.strokeStyle = 'rgba(218, 165, 32, 0.1)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 50; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Draw ground
function drawGround() {
    const groundY = canvas.height - 50;
    
    // Ground line
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.strokeStyle = '#daa520';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Ground fill
    ctx.fillStyle = 'rgba(218, 165, 32, 0.1)';
    ctx.fillRect(0, groundY, canvas.width, 50);
}

// Draw launch angle indicator
function drawLaunchAngle() {
    const startX = 50;
    const startY = canvas.height - 50;
    const angle = parseFloat(angleSlider.value) * Math.PI / 180;
    const radius = 40;
    
    // Draw angle arc
    ctx.beginPath();
    ctx.arc(startX, startY, radius, -angle, 0, false);
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw angle line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + radius * Math.cos(-angle), startY + radius * Math.sin(-angle));
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw angle label
    ctx.fillStyle = '#ffd700';
    ctx.font = '14px Segoe UI';
    ctx.fillText(
        angleSlider.value + '°',
        startX + (radius + 15) * Math.cos(-angle / 2),
        startY + (radius + 15) * Math.sin(-angle / 2)
    );
}

// Animation loop
function animate() {
    const dt = 0.016; // ~60 FPS
    
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

// Launch button handler
launchBtn.addEventListener('click', () => {
    if (isAnimating) {
        // Stop animation
        isAnimating = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        launchBtn.textContent = 'Launch';
        projectile = null;
        drawScene();
    } else {
        // Start animation
        const v0 = parseFloat(velocitySlider.value);
        const angle = parseFloat(angleSlider.value);
        const g = parseFloat(gravitySlider.value);
        
        projectile = new Projectile(v0, angle, g);
        isAnimating = true;
        launchBtn.textContent = 'Stop';
        
        animate();
    }
});

// Reset button handler
resetBtn.addEventListener('click', () => {
    // Stop any ongoing animation
    isAnimating = false;
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    // Reset projectile
    projectile = null;
    
    // Reset sliders to default values
    velocitySlider.value = 50;
    angleSlider.value = 45;
    gravitySlider.value = 9.8;
    
    velocityValue.textContent = '50';
    angleValue.textContent = '45';
    gravityValue.textContent = '9.8';
    
    // Reset button text
    launchBtn.textContent = 'Launch';
    
    // Reset current height display
    currentHeightDisplay.textContent = '0.00 m';
    
    // Recalculate and redraw
    calculateTrajectory();
});

// Toggle handlers
showTrajectoryCheckbox.addEventListener('change', drawScene);
showVectorsCheckbox.addEventListener('change', drawScene);

// Initial setup
calculateTrajectory();
