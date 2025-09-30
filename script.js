// Load MathJax dynamically
function loadMathJax() {
    // Load polyfill
    const polyfill = document.createElement('script');
    polyfill.src = 'https://polyfill.io/v3/polyfill.min.js?features=es6';
    document.head.appendChild(polyfill);
    
    // Load MathJax
    const mathjax = document.createElement('script');
    mathjax.id = 'MathJax-script';
    mathjax.async = true;
    mathjax.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
    document.head.appendChild(mathjax);
    
    // Configure MathJax
    window.MathJax = {
        tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']]
        },
        svg: {
            fontCache: 'global'
        }
    };
}

// Call this function when your page loads
loadMathJax();

// Opening Animation
document.addEventListener('DOMContentLoaded', function() {
    const introOverlay = document.getElementById('introOverlay');
    const skipIntroBtn = document.getElementById('skipIntro');
    const mainContent = document.getElementById('main-content');
    const introCanvas = document.getElementById('introCanvas');
    const introText = document.getElementById('introText');
    
    // Three.js Scene Setup
    let scene, camera, renderer, particles;
    
    function initIntroScene() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ canvas: introCanvas, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Create particles
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 1500;
        const posArray = new Float32Array(particleCount * 3);
        
        for(let i = 0; i < particleCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 10;
        }
        
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.02,
            color: 0x38a169
        });
        
        particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);
        
        camera.position.z = 5;
        
        // Animation
        function animate() {
            requestAnimationFrame(animate);
            
            particles.rotation.x += 0.001;
            particles.rotation.y += 0.001;
            
            renderer.render(scene, camera);
        }
        
        animate();
        
        // Text animation
        let opacity = 0;
        const fadeInInterval = setInterval(() => {
            opacity += 0.02;
            introText.style.opacity = opacity;
            
            if(opacity >= 1) {
                clearInterval(fadeInInterval);
                
                // Auto transition after 4 seconds
                setTimeout(() => {
                    hideIntro();
                }, 4000);
            }
        }, 50);
    }
    
    function hideIntro() {
        introOverlay.style.animation = 'introFadeOut 1s forwards';
        
        setTimeout(() => {
            introOverlay.style.display = 'none';
            mainContent.style.display = 'block';
        }, 1000);
    }
    
    skipIntroBtn.addEventListener('click', hideIntro);
    
    // Initialize the scene
    initIntroScene();
    
    // Handle window resize
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});

// Slideshow Functionality
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicators = document.querySelectorAll('.indicator');
    const currentSlideElement = document.getElementById('currentSlide');
    const totalSlidesElement = document.getElementById('totalSlides');
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    // Set total slides count
    totalSlidesElement.textContent = totalSlides;
    
    // Function to show a specific slide
    function showSlide(n) {
        // Hide all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Remove active class from all indicators
        indicators.forEach(indicator => {
            indicator.classList.remove('active');
        });
        
        // Ensure the slide index is within bounds
        if (n >= totalSlides) {
            currentSlide = 0;
        } else if (n < 0) {
            currentSlide = totalSlides - 1;
        } else {
            currentSlide = n;
        }
        
        // Show the current slide
        slides[currentSlide].classList.add('active');
        
        // Update the active indicator
        indicators[currentSlide].classList.add('active');
        
        // Update the current slide number
        currentSlideElement.textContent = currentSlide + 1;
        
        // Update button states
        updateButtonStates();
    }
    
    // Function to update button states
    function updateButtonStates() {
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;
    }
    
    // Event listeners for buttons
    prevBtn.addEventListener('click', function() {
        showSlide(currentSlide - 1);
    });
    
    nextBtn.addEventListener('click', function() {
        showSlide(currentSlide + 1);
    });
    
    // Event listeners for indicators
    indicators.forEach(indicator => {
        indicator.addEventListener('click', function() {
            const slideIndex = parseInt(this.getAttribute('data-slide'));
            showSlide(slideIndex);
        });
    });
    
    // Initialize the slideshow
    showSlide(currentSlide);
    
    // Keyboard navigation
    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowLeft') {
            showSlide(currentSlide - 1);
        } else if (event.key === 'ArrowRight') {
            showSlide(currentSlide + 1);
        }
    });
});

// Algorithm Visualizer 1 (Graph Visualization)
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('algo-canvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-viz');
    const resetBtn = document.getElementById('reset-viz');
    const stepBtn = document.getElementById('step-viz');
    const messageDiv = document.getElementById('viz-message');
    
    // Set canvas size
    function setCanvasSize() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = 420;
    }
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Visualizer state
    let animationId;
    let step = 0;
    let isRunning = false;
    
    // Example cost matrix
    const costMatrix = [
        [9, 2, 7],
        [6, 4, 3],
        [5, 8, 1]
    ];
    
    // Workers and jobs
    const workers = ['Worker 1', 'Worker 2', 'Worker 3'];
    const jobs = ['Job 1', 'Job 2', 'Job 3'];
    
    // Initialize visualizer
    function initVisualizer() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGraph();
        messageDiv.textContent = 'Click "Start Visualization" to begin.';
        step = 0;
        isRunning = false;
    }
    
    // Draw the graph visualization
    function drawGraph() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#02101a');
        gradient.addColorStop(1, '#041428');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw workers on left
        const workerCount = costMatrix.length;
        const jobCount = costMatrix[0].length;
        const nodeRadius = Math.min(canvas.width, canvas.height) / 20;
        const centerY = canvas.height / 2;
        const leftX = canvas.width * 0.2;
        const rightX = canvas.width * 0.8;
        
        // Calculate vertical spacing
        const maxNodes = Math.max(workerCount, jobCount);
        const verticalSpacing = canvas.height / (maxNodes + 1);
        
        // Draw worker nodes
        for (let i = 0; i < workerCount; i++) {
            const y = verticalSpacing * (i + 1);
            drawNode(leftX, y, nodeRadius, '#e53e3e', `W${i+1}`);
        }
        
        // Draw job nodes
        for (let j = 0; j < jobCount; j++) {
            const y = verticalSpacing * (j + 1);
            drawNode(rightX, y, nodeRadius, '#38a169', `J${j+1}`);
        }
        
        // Draw connections with costs
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        for (let i = 0; i < workerCount; i++) {
            for (let j = 0; j < jobCount; j++) {
                const startY = verticalSpacing * (i + 1);
                const endY = verticalSpacing * (j + 1);
                
                // Determine line style based on current step
                let lineColor = 'rgba(255, 255, 255, 0.2)';
                let lineWidth = 1;
                
                // Highlight based on algorithm step
                if (step >= 1 && step <= 4) {
                    // Highlight minimum values during reduction steps
                    const rowMin = Math.min(...costMatrix[i]);
                    const colMin = Math.min(...costMatrix.map(row => row[j]));
                    
                    if (costMatrix[i][j] === rowMin || costMatrix[i][j] === colMin) {
                        lineColor = '#f6e05e';
                        lineWidth = 3;
                    }
                }
                
                // Highlight assignment in final step
                if (step === 4) {
                    // Simple assignment for visualization
                    if ((i === 0 && j === 1) || (i === 1 && j === 0) || (i === 2 && j === 2)) {
                        lineColor = '#ec4899';
                        lineWidth = 4;
                    }
                }
                
                // Draw the line
                ctx.strokeStyle = lineColor;
                ctx.lineWidth = lineWidth;
                ctx.setLineDash([]);
                
                ctx.beginPath();
                ctx.moveTo(leftX + nodeRadius, startY);
                ctx.lineTo(rightX - nodeRadius, endY);
                ctx.stroke();
                
                // Draw cost label
                const midX = (leftX + rightX) / 2;
                const midY = (startY + endY) / 2;
                
                ctx.fillStyle = lineColor;
                ctx.fillText(costMatrix[i][j], midX, midY);
            }
        }
    }
    
    // Draw a node
    function drawNode(x, y, radius, color, label) {
        // Node glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
        gradient.addColorStop(0, color + 'CC');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - radius * 2, y - radius * 2, radius * 4, radius * 4);
        
        // Node body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Node border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Node label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x, y);
    }
    
    // Animate the algorithm steps
    function animateStep() {
        if (!isRunning) return;
        
        step++;
        
        switch(step) {
            case 1:
                messageDiv.textContent = 'Step 1: Original cost matrix';
                break;
            case 2:
                messageDiv.textContent = 'Step 2: Row reduction - finding minimum in each row';
                break;
            case 3:
                messageDiv.textContent = 'Step 3: Column reduction - finding minimum in each column';
                break;
            case 4:
                messageDiv.textContent = 'Step 4: Finding optimal assignment';
                break;
            case 5:
                messageDiv.textContent = 'Complete! Optimal assignment found with total cost 9';
                isRunning = false;
                break;
            default:
                step = 0;
                isRunning = false;
        }
        
        drawGraph();
        
        if (isRunning && step < 5) {
            animationId = setTimeout(animateStep, 2000);
        }
    }
    
    // Event listeners for visualizer buttons
    startBtn.addEventListener('click', function() {
        if (!isRunning) {
            isRunning = true;
            step = 0;
            animateStep();
        }
    });
    
    resetBtn.addEventListener('click', function() {
        isRunning = false;
        if (animationId) {
            clearTimeout(animationId);
        }
        initVisualizer();
    });
    
    stepBtn.addEventListener('click', function() {
        if (!isRunning) {
            isRunning = true;
            animateStep();
            isRunning = false;
        }
    });
    
    // Initialize the visualizer
    initVisualizer();
});

// Algorithm Visualizer 2 (Matrix Visualization)
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-viz2');
    const resetBtn = document.getElementById('reset-viz2');
    const stepBtn = document.getElementById('step-viz2');
    const messageDiv = document.getElementById('viz-message2');
    
    // Set canvas size
    function setCanvasSize() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = 420;
    }
    
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Visualizer state
    let animationId;
    let step = 0;
    let isRunning = false;
    
    // Example cost matrix
    const costMatrix = [
        [9, 2, 7],
        [6, 4, 3],
        [5, 8, 1]
    ];
    
    // Workers and jobs
    const workers = ['Worker 1', 'Worker 2', 'Worker 3'];
    const jobs = ['Job 1', 'Job 2', 'Job 3'];
    
    // Initialize visualizer
    function initVisualizer() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMatrix();
        messageDiv.textContent = 'Click "Start Visualization" to begin the Hungarian Algorithm.';
        step = 0;
        isRunning = false;
    }
    
    // Draw the cost matrix
    function drawMatrix() {
        const cellWidth = canvas.width / 4;
        const cellHeight = canvas.height / 4;
        
        // Clear canvas with gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#02101a');
        gradient.addColorStop(1, '#041428');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw headers
        ctx.fillStyle = '#e53e3e';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw worker labels
        for (let i = 0; i < workers.length; i++) {
            ctx.fillText(workers[i], cellWidth / 2, (i + 1.5) * cellHeight);
        }
        
        // Draw job labels
        for (let j = 0; j < jobs.length; j++) {
            ctx.fillText(jobs[j], (j + 1.5) * cellWidth, cellHeight / 2);
        }
        
        // Draw matrix cells
        ctx.font = 'bold 18px Arial';
        
        for (let i = 0; i < costMatrix.length; i++) {
            for (let j = 0; j < costMatrix[i].length; j++) {
                const x = (j + 1.5) * cellWidth;
                const y = (i + 1.5) * cellHeight;
                
                // Draw cell background
                ctx.fillStyle = 'rgba(56, 161, 105, 0.1)';
                ctx.fillRect(x - cellWidth/2, y - cellHeight/2, cellWidth, cellHeight);
                
                // Draw cell border
                ctx.strokeStyle = '#38a169';
                ctx.lineWidth = 2;
                ctx.strokeRect(x - cellWidth/2, y - cellHeight/2, cellWidth, cellHeight);
                
                // Draw cost value
                ctx.fillStyle = '#38a169';
                ctx.fillText(costMatrix[i][j], x, y);
            }
        }
    }
    
    // Animate the algorithm steps
    function animateStep() {
        if (!isRunning) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMatrix();
        
        // Highlight current step
        const cellWidth = canvas.width / 4;
        const cellHeight = canvas.height / 4;
        
        switch(step) {
            case 0:
                messageDiv.textContent = 'Original cost matrix - Ready to start algorithm';
                break;
                
            case 1:
                messageDiv.textContent = 'Step 1: Row reduction - subtract minimum from each row';
                ctx.fillStyle = 'rgba(245, 158, 11, 0.3)'; // Amber highlight
                for (let i = 0; i < costMatrix.length; i++) {
                    const min = Math.min(...costMatrix[i]);
                    for (let j = 0; j < costMatrix[i].length; j++) {
                        if (costMatrix[i][j] === min) {
                            const x = (j + 1.5) * cellWidth;
                            const y = (i + 1.5) * cellHeight;
                            ctx.beginPath();
                            ctx.arc(x, y, cellWidth/3, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
                break;
                
            case 2:
                messageDiv.textContent = 'Step 2: Column reduction - subtract minimum from each column';
                ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'; // Blue highlight
                for (let j = 0; j < costMatrix[0].length; j++) {
                    let min = Infinity;
                    for (let i = 0; i < costMatrix.length; i++) {
                        if (costMatrix[i][j] < min) min = costMatrix[i][j];
                    }
                    for (let i = 0; i < costMatrix.length; i++) {
                        if (costMatrix[i][j] === min) {
                            const x = (j + 1.5) * cellWidth;
                            const y = (i + 1.5) * cellHeight;
                            ctx.beginPath();
                            ctx.arc(x, y, cellWidth/3, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
                break;
                
            case 3:
                messageDiv.textContent = 'Step 3: Find minimum lines to cover all zeros';
                // Draw lines covering zeros
                ctx.strokeStyle = '#e53e3e';
                ctx.lineWidth = 4;
                ctx.setLineDash([5, 5]);
                
                // Vertical line through column 1
                ctx.beginPath();
                ctx.moveTo(cellWidth, 0);
                ctx.lineTo(cellWidth, canvas.height);
                ctx.stroke();
                
                // Horizontal line through row 2
                ctx.beginPath();
                ctx.moveTo(0, 2 * cellHeight);
                ctx.lineTo(canvas.width, 2 * cellHeight);
                ctx.stroke();
                
                ctx.setLineDash([]);
                break;
                
            case 4:
                messageDiv.textContent = 'Step 4: Find smallest uncovered element and adjust matrix';
                ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'; // Red highlight
                // Highlight uncovered elements
                const uncoveredElements = [
                    [0, 0], [0, 2],  // W1: J1, J3
                    [1, 1],          // W2: J2  
                    [2, 0], [2, 1]   // W3: J1, J2
                ];
                
                uncoveredElements.forEach(([i, j]) => {
                    const x = (j + 1.5) * cellWidth;
                    const y = (i + 1.5) * cellHeight;
                    ctx.fillRect(x - cellWidth/2, y - cellHeight/2, cellWidth, cellHeight);
                });
                break;
                
            case 5:
                messageDiv.textContent = 'Optimal assignment found!';
                // Highlight optimal assignment
                ctx.fillStyle = 'rgba(34, 197, 94, 0.5)'; // Green highlight
                const assignment = [
                    [0, 1], // W1 -> J2
                    [1, 0], // W2 -> J1  
                    [2, 2]  // W3 -> J3
                ];
                
                assignment.forEach(([i, j]) => {
                    const x = (j + 1.5) * cellWidth;
                    const y = (i + 1.5) * cellHeight;
                    ctx.fillRect(x - cellWidth/2, y - cellHeight/2, cellWidth, cellHeight);
                    
                    // Draw check mark
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.moveTo(x - 15, y);
                    ctx.lineTo(x - 5, y + 10);
                    ctx.lineTo(x + 15, y - 10);
                    ctx.stroke();
                });
                isRunning = false;
                break;
        }
        
        step++;
        if (step > 5) {
            step = 0;
            isRunning = false;
            messageDiv.textContent = 'Visualization complete! Click "Start" to run again.';
        }
        
        if (isRunning) {
            animationId = setTimeout(animateStep, 2500);
        }
    }
    
    // Event listeners for visualizer buttons
    startBtn.addEventListener('click', function() {
        if (!isRunning) {
            isRunning = true;
            step = 0;
            animateStep();
        }
    });
    
    resetBtn.addEventListener('click', function() {
        isRunning = false;
        if (animationId) {
            clearTimeout(animationId);
        }
        initVisualizer();
    });
    
    stepBtn.addEventListener('click', function() {
        if (!isRunning) {
            isRunning = true;
            animateStep();
            isRunning = false;
        }
    });
    
    // Initialize the visualizer
    initVisualizer();
});

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Initialize MathJax
window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']]
    },
    svg: {
        fontCache: 'global'
    }
};