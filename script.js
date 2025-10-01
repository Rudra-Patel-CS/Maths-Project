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
        },
        startup: {
            pageReady: () => {
                return MathJax.startup.defaultPageReady().then(() => {
                    // Re-render MathJax on window resize for mobile
                    window.addEventListener('resize', () => {
                        if (window.MathJax.typesetPromise) {
                            window.MathJax.typesetPromise();
                        }
                    });
                });
            }
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
        // Check if WebGL is supported
        try {
            const context = introCanvas.getContext('webgl') || introCanvas.getContext('experimental-webgl');
            if (!context) {
                throw new Error('WebGL not supported');
            }
            
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer({ 
                canvas: introCanvas, 
                alpha: true,
                antialias: true 
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
            
            // Create particles
            const particleGeometry = new THREE.BufferGeometry();
            const particleCount = window.innerWidth < 768 ? 800 : 1500; // Reduce particles on mobile
            const posArray = new Float32Array(particleCount * 3);
            
            for(let i = 0; i < particleCount * 3; i++) {
                posArray[i] = (Math.random() - 0.5) * 10;
            }
            
            particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
            const particleMaterial = new THREE.PointsMaterial({
                size: 0.02,
                color: 0x38a169,
                transparent: true,
                opacity: 0.8
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
            
        } catch (error) {
            console.warn('WebGL not supported, falling back to CSS animation');
            // Fallback animation
            introCanvas.style.display = 'none';
        }
        
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
            // Trigger MathJax rendering after intro
            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise();
            }
        }, 1000);
    }
    
    skipIntroBtn.addEventListener('click', hideIntro);
    
    // Initialize the scene
    initIntroScene();
    
    // Handle window resize with debounce
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (camera && renderer) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }
        }, 250);
    });
});

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav ul');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('show');
            menuToggle.textContent = navMenu.classList.contains('show') ? '✕' : '☰';
            // Prevent body scroll when menu is open on mobile
            document.body.style.overflow = navMenu.classList.contains('show') ? 'hidden' : '';
        });
        
        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('nav ul li a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('show');
                menuToggle.textContent = '☰';
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('nav') && navMenu.classList.contains('show')) {
                navMenu.classList.remove('show');
                menuToggle.textContent = '☰';
                document.body.style.overflow = '';
            }
        });
    }
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
        if (indicators[currentSlide]) {
            indicators[currentSlide].classList.add('active');
        }
        
        // Update the current slide number
        currentSlideElement.textContent = currentSlide + 1;
        
        // Update button states
        updateButtonStates();
        
        // Re-render MathJax for the current slide
        if (window.MathJax && window.MathJax.typesetPromise) {
            setTimeout(() => {
                window.MathJax.typesetPromise([slides[currentSlide]]);
            }, 100);
        }
    }
    
    // Function to update button states
    function updateButtonStates() {
        if (prevBtn) prevBtn.disabled = currentSlide === 0;
        if (nextBtn) nextBtn.disabled = currentSlide === totalSlides - 1;
    }
    
    // Event listeners for buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            showSlide(currentSlide - 1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            showSlide(currentSlide + 1);
        });
    }
    
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
    
    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    const slideshowContainer = document.querySelector('.slideshow-container');
    if (slideshowContainer) {
        slideshowContainer.addEventListener('touchstart', function(event) {
            touchStartX = event.changedTouches[0].screenX;
        });
        
        slideshowContainer.addEventListener('touchend', function(event) {
            touchEndX = event.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - next slide
                    showSlide(currentSlide + 1);
                } else {
                    // Swipe right - previous slide
                    showSlide(currentSlide - 1);
                }
            }
        }
    }
});

// Algorithm Visualizer 1 (Graph Visualization)
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('algo-canvas-1');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-viz-1');
    const resetBtn = document.getElementById('reset-viz-1');
    const stepBtn = document.getElementById('step-viz-1');
    const messageDiv = document.getElementById('viz-message-1');
    
    // Set canvas size
    function setCanvasSize() {
        const container = canvas.parentElement;
        if (container) {
            canvas.width = container.clientWidth;
            canvas.height = window.innerWidth < 768 ? 300 : 420;
        }
    }
    
    setCanvasSize();
    
    // Debounced resize handler
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(setCanvasSize, 250);
    });
    
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
    
    // Initialize visualizer
    function initVisualizer() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGraph();
        if (messageDiv) messageDiv.textContent = 'Click "Start Visualization" to begin.';
        step = 0;
        isRunning = false;
        
        // Update stats
        updateStats();
    }
    
    // Update statistics panel
    function updateStats() {
        const stats = document.querySelectorAll('#visualizer .stat-value');
        if (stats.length >= 4) {
            stats[0].textContent = step;
            stats[1].textContent = step * 2 + 's';
            stats[2].textContent = step >= 4 ? '9' : '-';
            stats[3].textContent = getStatusText();
        }
    }
    
    function getStatusText() {
        switch(step) {
            case 0: return 'Ready';
            case 1: return 'Initial Matrix';
            case 2: return 'Row Reduction';
            case 3: return 'Column Reduction';
            case 4: return 'Finding Assignment';
            case 5: return 'Complete';
            default: return 'Ready';
        }
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
        
        // Draw grid pattern for better visualization
        drawGrid();
        
        // Draw workers on left
        const workerCount = costMatrix.length;
        const jobCount = costMatrix[0].length;
        const nodeRadius = Math.min(canvas.width, canvas.height) / (window.innerWidth < 768 ? 15 : 20);
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
        ctx.font = window.innerWidth < 768 ? '12px Arial' : '14px Arial';
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
                
                // Background for cost label
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                const textWidth = ctx.measureText(costMatrix[i][j]).width;
                ctx.fillRect(midX - textWidth/2 - 5, midY - 8, textWidth + 10, 16);
                
                // Cost text
                ctx.fillStyle = '#ffffff';
                ctx.font = window.innerWidth < 768 ? 'bold 10px Arial' : 'bold 12px Arial';
                ctx.fillText(costMatrix[i][j], midX, midY);
            }
        }
        
        // Draw step information
        drawStepInfo();
    }
    
    // Draw grid pattern
    function drawGrid() {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        
        const gridSize = window.innerWidth < 768 ? 30 : 50;
        
        // Vertical lines
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }
    
    // Draw step information
    function drawStepInfo() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = window.innerWidth < 768 ? 'bold 14px Arial' : 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        const info = [
            `Step: ${step}/5`,
            `Status: ${getStatusText()}`,
            `Matrix: 3x3`
        ];
        
        info.forEach((text, index) => {
            ctx.fillText(text, 10, 10 + index * 20);
        });
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
        ctx.font = window.innerWidth < 768 ? 'bold 14px Arial' : 'bold 16px Arial';
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
                if (messageDiv) messageDiv.textContent = 'Step 1: Original cost matrix';
                break;
            case 2:
                if (messageDiv) messageDiv.textContent = 'Step 2: Row reduction - finding minimum in each row';
                break;
            case 3:
                if (messageDiv) messageDiv.textContent = 'Step 3: Column reduction - finding minimum in each column';
                break;
            case 4:
                if (messageDiv) messageDiv.textContent = 'Step 4: Finding optimal assignment';
                break;
            case 5:
                if (messageDiv) messageDiv.textContent = 'Complete! Optimal assignment found with total cost 9';
                isRunning = false;
                break;
            default:
                step = 0;
                isRunning = false;
        }
        
        drawGraph();
        updateStats();
        
        if (isRunning && step < 5) {
            animationId = setTimeout(animateStep, 2000);
        }
    }
    
    // Event listeners for visualizer buttons
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            if (!isRunning) {
                isRunning = true;
                step = 0;
                animateStep();
            }
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            isRunning = false;
            if (animationId) {
                clearTimeout(animationId);
            }
            initVisualizer();
        });
    }
    
    if (stepBtn) {
        stepBtn.addEventListener('click', function() {
            if (!isRunning) {
                isRunning = true;
                animateStep();
                isRunning = false;
            }
        });
    }
    
    // Add keyboard controls
    document.addEventListener('keydown', function(event) {
        if (event.key === ' ') {
            // Space bar to start/pause
            if (!isRunning) {
                isRunning = true;
                animateStep();
            }
        } else if (event.key === 'r' || event.key === 'R') {
            // R key to reset
            if (resetBtn) resetBtn.click();
        } else if (event.key === 'ArrowRight') {
            // Right arrow for step forward
            if (stepBtn) stepBtn.click();
        }
    });
    
    // Initialize the visualizer
    initVisualizer();
});

// Matrix Visualizer 2
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-viz2');
    const resetBtn = document.getElementById('reset-viz2');
    const stepBtn = document.getElementById('step-viz2');
    const messageDiv = document.getElementById('viz-message2');
    
    // Set canvas size
    function setCanvasSize() {
        const container = canvas.parentElement;
        if (container) {
            canvas.width = container.clientWidth;
            canvas.height = window.innerWidth < 768 ? 300 : 420;
        }
    }
    
    setCanvasSize();
    
    // Debounced resize handler
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(setCanvasSize, 250);
    });
    
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
    
    // Initialize visualizer
    function initVisualizer() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMatrix();
        if (messageDiv) messageDiv.textContent = 'Click "Start Visualization" to begin.';
        step = 0;
        isRunning = false;
        updateStats();
    }
    
    // Update statistics panel
    function updateStats() {
        const stats = document.querySelectorAll('#visualizer2 .stat-value');
        if (stats.length >= 4) {
            stats[0].textContent = '3×3';
            stats[1].textContent = step * 3;
            stats[2].textContent = step >= 4 ? '9' : '-';
            stats[3].textContent = step >= 4 ? 'Optimal' : 'Processing';
        }
    }
    
    // Draw matrix visualization
    function drawMatrix() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#02101a');
        gradient.addColorStop(1, '#041428');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        drawGrid();
        
        const matrix = costMatrix;
        const rows = matrix.length;
        const cols = matrix[0].length;
        
        // Calculate cell size and position
        const cellSize = Math.min(canvas.width, canvas.height) / (Math.max(rows, cols) + (window.innerWidth < 768 ? 3 : 2));
        const startX = (canvas.width - cols * cellSize) / 2;
        const startY = (canvas.height - rows * cellSize) / 2;
        
        // Draw matrix cells
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const x = startX + j * cellSize;
                const y = startY + i * cellSize;
                
                // Determine cell color based on current step
                let cellColor = 'rgba(255, 255, 255, 0.1)';
                let textColor = '#ffffff';
                
                if (step >= 2) {
                    // Highlight row minimums
                    const rowMin = Math.min(...matrix[i]);
                    if (matrix[i][j] === rowMin) {
                        cellColor = 'rgba(246, 224, 94, 0.3)';
                    }
                }
                
                if (step >= 3) {
                    // Highlight column minimums
                    const colMin = Math.min(...matrix.map(row => row[j]));
                    if (matrix[i][j] === colMin) {
                        cellColor = 'rgba(56, 161, 105, 0.3)';
                    }
                }
                
                if (step >= 4) {
                    // Highlight assignments
                    if ((i === 0 && j === 1) || (i === 1 && j === 0) || (i === 2 && j === 2)) {
                        cellColor = 'rgba(236, 72, 153, 0.4)';
                    }
                }
                
                // Draw cell
                ctx.fillStyle = cellColor;
                ctx.fillRect(x, y, cellSize, cellSize);
                
                // Draw cell border
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, cellSize, cellSize);
                
                // Draw cell value
                ctx.fillStyle = textColor;
                ctx.font = window.innerWidth < 768 ? 'bold 14px Arial' : 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(matrix[i][j], x + cellSize/2, y + cellSize/2);
            }
        }
        
        // Draw step information
        drawStepInfo();
    }
    
    // Draw grid pattern
    function drawGrid() {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        
        const gridSize = window.innerWidth < 768 ? 30 : 50;
        
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }
    
    // Draw step information
    function drawStepInfo() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = window.innerWidth < 768 ? 'bold 14px Arial' : 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        const steps = [
            'Step 1: Initial Matrix',
            'Step 2: Row Reduction',
            'Step 3: Column Reduction', 
            'Step 4: Optimal Assignment',
            'Step 5: Complete'
        ];
        
        ctx.fillText(`Current: ${steps[Math.min(step, 4)]}`, 10, 10);
    }
    
    // Animate steps
    function animateStep() {
        if (!isRunning) return;
        
        step++;
        
        switch(step) {
            case 1:
                if (messageDiv) messageDiv.textContent = 'Step 1: Displaying initial cost matrix';
                break;
            case 2:
                if (messageDiv) messageDiv.textContent = 'Step 2: Row reduction - subtracting row minimums';
                break;
            case 3:
                if (messageDiv) messageDiv.textContent = 'Step 3: Column reduction - subtracting column minimums';
                break;
            case 4:
                if (messageDiv) messageDiv.textContent = 'Step 4: Finding optimal assignment';
                break;
            case 5:
                if (messageDiv) messageDiv.textContent = 'Complete! Optimal assignment found';
                isRunning = false;
                break;
            default:
                step = 0;
                isRunning = false;
        }
        
        drawMatrix();
        updateStats();
        
        if (isRunning && step < 5) {
            animationId = setTimeout(animateStep, 2000);
        }
    }
    
    // Event listeners
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            if (!isRunning) {
                isRunning = true;
                step = 0;
                animateStep();
            }
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            isRunning = false;
            if (animationId) {
                clearTimeout(animationId);
            }
            initVisualizer();
        });
    }
    
    if (stepBtn) {
        stepBtn.addEventListener('click', function() {
            if (!isRunning) {
                isRunning = true;
                animateStep();
                isRunning = false;
            }
        });
    }
    
    // Initialize
    initVisualizer();
});

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Back to top functionality
document.addEventListener('DOMContentLoaded', function() {
    const backToTopBtn = document.querySelector('.back-to-top');
    
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Show/hide back to top button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopBtn.style.display = 'flex';
            } else {
                backToTopBtn.style.display = 'none';
            }
        });
    }
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

// Performance optimization for mobile
if (window.innerWidth < 768) {
    // Reduce animation intensity on mobile
    document.documentElement.style.setProperty('--animation-duration', '0.3s');
}

// Handle orientation changes
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 300);
});