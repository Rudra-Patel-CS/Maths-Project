/* ---------- 1. INTRO ANIMATION SCRIPT ---------- */
(function(){
  const overlay = document.getElementById('introOverlay');
  const canvas = document.getElementById('introCanvas');
  const skipBtn = document.getElementById('skipIntro');
  if (!overlay || !canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });

  let w = canvas.width = window.innerWidth * devicePixelRatio;
  let h = canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.scale(devicePixelRatio, devicePixelRatio);

  let raf;
  const N_intro = 4;
  function nodeRadiusForSize(){
    return Math.max(6, Math.min(12, Math.round(Math.min(window.innerWidth, window.innerHeight)/80)));
  }
  let nodeRadius = nodeRadiusForSize();
  let leftX = Math.round(window.innerWidth*0.23);
  let rightX = Math.round(window.innerWidth*0.77);
  let yStart = (window.innerHeight - (N_intro-1)* (nodeRadius*6)) / 2;
  const duration = 4500;
  const revealDelay = 1200;
  const globalStart = performance.now();

  const workers = [];
  const jobs = [];
  for (let i=0;i<N_intro;i++){
    const y = yStart + i*(nodeRadius*6);
    workers.push({x:leftX, y, r:nodeRadius});
    jobs.push({x:rightX, y, r:nodeRadius});
  }

  function onResize(){
    const DPR = devicePixelRatio || 1;
    canvas.width = Math.max(300, window.innerWidth * DPR);
    canvas.height = Math.max(200, window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    nodeRadius = nodeRadiusForSize();
    leftX = Math.round(window.innerWidth*0.23);
    rightX = Math.round(window.innerWidth*0.77);
    yStart = (window.innerHeight - (N_intro-1)* (nodeRadius*6)) / 2;
    for (let i=0;i<N_intro;i++){
      workers[i].x = leftX;
      workers[i].y = yStart + i*(nodeRadius*6);
      workers[i].r = nodeRadius;
      jobs[i].x = rightX;
      jobs[i].y = yStart + i*(nodeRadius*6);
      jobs[i].r = nodeRadius;
    }
  }
  window.addEventListener('resize', onResize);

  function draw(now){
    const t = now - globalStart;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if (document.body.classList.contains('light-mode')){
      const g = ctx.createLinearGradient(0,0,0,window.innerHeight);
      g.addColorStop(0, '#f8fafc'); g.addColorStop(1, '#eef2f7'); ctx.fillStyle = g;
    } else {
      const g = ctx.createLinearGradient(0,0,0,window.innerHeight);
      g.addColorStop(0, '#020617'); g.addColorStop(1, '#041028'); ctx.fillStyle = g;
    }
    ctx.fillRect(0,0,window.innerWidth,window.innerHeight);

    const particleCount = 24;
    for (let p=0;p<particleCount;p++){
      const px = (p*173 % window.innerWidth) + Math.sin((t/800)+(p*13))*18;
      const py = (p*97 % window.innerHeight) + Math.cos((t/900)+(p*7))*12;
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = document.body.classList.contains('light-mode') ? '#0b1724' : '#9fd3ff';
      ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    for (let i=0;i<N_intro;i++){
      const nW = workers[i];
      const pulse = 0.9 + 0.1*Math.sin((t/240) + i);
      ctx.beginPath();
      ctx.fillStyle = document.body.classList.contains('light-mode') ? '#2563EB' : '#69f0ff';
      ctx.arc(nW.x, nW.y, nW.r * pulse, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (let j=0;j<N_intro;j++){
      const nJ = jobs[j];
      const pulse = 0.9 + 0.1*Math.cos((t/260) + j);
      ctx.beginPath();
      ctx.fillStyle = document.body.classList.contains('light-mode') ? '#f97316' : '#ffb86b';
      ctx.arc(nJ.x, nJ.y, nJ.r * pulse, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    const connProgress = Math.max(0, Math.min(1, (t - revealDelay) / (duration - revealDelay)));

    for (let i=0;i<N_intro;i++){
      for (let j=0;j<N_intro;j++){
        const A = workers[i], B = jobs[j];
        ctx.beginPath();
        ctx.strokeStyle = document.body.classList.contains('light-mode') ? 'rgba(3,16,36,0.06)' : 'rgba(140,170,200,0.05)';
        ctx.lineWidth = 1;
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.stroke();
      }
    }

    for (let k=0;k<N_intro;k++){
      const i = k;
      const j = (k + 2) % N_intro;
      const A = workers[i], B = jobs[j];
      const drawFrac = connProgress;
      const ex = A.x + (B.x - A.x)*drawFrac;
      const ey = A.y + (B.y - A.y)*drawFrac;
      ctx.beginPath();
      ctx.strokeStyle = document.body.classList.contains('light-mode') ? '#059669' : '#00ff88';
      ctx.lineWidth = 2.2;
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    if (connProgress >= 0.98){
      setTimeout(()=> {
        if (!overlay.classList.contains('intro-exiting')){
          overlay.classList.add('intro-exiting');
          setTimeout(()=>{ overlay.style.display='none'; }, 700);
        }
      }, 240);
      cancelAnimationFrame(raf);
      return;
    }

    raf = requestAnimationFrame(draw);
  }

  function skipNow(){
    if (!overlay.classList.contains('intro-exiting')){
      overlay.classList.add('intro-exiting');
      setTimeout(()=>{ overlay.style.display='none'; }, 700);
    }
    cancelAnimationFrame(raf);
  }
  skipBtn.addEventListener('click', skipNow);
  overlay.addEventListener('click', (e)=>{ if (e.target === skipBtn) return; skipNow(); });
  window.addEventListener('keydown', (ev)=>{ if (ev.code === 'Space' || ev.key === 'Escape') { ev.preventDefault(); skipNow(); } });

  setTimeout(()=>{ if (overlay && !overlay.classList.contains('intro-exiting')) skipNow(); }, 7000);

  raf = requestAnimationFrame(draw);
})();


/* ---------- 2. THREE.JS 3D VISUALIZER SCRIPT ---------- */
(function(){
  const canvas3 = document.getElementById('algo-canvas');
  const container = document.getElementById('algo-canvas-container') || document.body;
  let scene, camera, renderer;
  let nodes = [], edges = [], workerPositions = [], jobPositions = [];
  const N3 = 4;

  const nodeGeo = new THREE.SphereGeometry(0.3, 32, 32);
  const workerMat = new THREE.MeshPhongMaterial({ color: 0x3b82f6 });
  const jobMat = new THREE.MeshPhongMaterial({ color: 0xf97316 });
  const lineMat = new THREE.LineBasicMaterial({ color: 0x94a3b8, linewidth: 1 });
  const assignedLineMat = new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 4 });

  const optimalAssignment = [
    { w:0, j:2 }, { w:1, j:3 }, { w:2, j:0 }, { w:3, j:1 }
  ];

  function initThree(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x041428);

    const aspect = (container.clientWidth || window.innerWidth) / (container.clientHeight || 420);
    camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.set(0, 0, 8);

    renderer = new THREE.WebGLRenderer({ canvas: canvas3, antialias:true, alpha:true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    resizeThree();

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5,10,7.5);
    scene.add(dir);

    generateGraph();
    window.addEventListener('resize', resizeThree);
    animate();
  }

  function resizeThree(){
    const w = container.clientWidth || window.innerWidth;
    const h = Math.max(240, container.clientHeight || 420);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function clearScene(){
    nodes.forEach(n=>scene.remove(n));
    edges.forEach(e=>scene.remove(e));
    nodes = []; edges = []; workerPositions = []; jobPositions = [];
  }

  function generateGraph(){
    clearScene();
    const sideOffset = 3;
    const spacing = 2;
    const startY = (N3 - 1) * spacing / 2;

    for (let i=0;i<N3;i++){
      const x = -sideOffset, y = startY - i*spacing, z=0;
      const m = new THREE.Mesh(nodeGeo, workerMat);
      m.position.set(x,y,z);
      scene.add(m);
      nodes.push(m); workerPositions.push(m.position);
    }
    for (let j=0;j<N3;j++){
      const x = sideOffset, y = startY - j*spacing, z=0;
      const m = new THREE.Mesh(nodeGeo, jobMat);
      m.position.set(x,y,z);
      scene.add(m);
      nodes.push(m); jobPositions.push(m.position);
    }
    for (let i=0;i<N3;i++){
      for (let j=0;j<N3;j++){
        const pts = [ workerPositions[i], jobPositions[j] ];
        const geom = new THREE.BufferGeometry().setFromPoints(pts);
        const line = new THREE.Line(geom, lineMat);
        scene.add(line);
        edges.push(line);
      }
    }
    document.getElementById('viz-message').textContent = "Graph ready. Click 'Show Optimal Assignment'.";
  }

  function showAssignment(){
    edges.forEach(e=>scene.remove(e));
    edges = [];
    optimalAssignment.forEach(p=>{
      const pts = [ workerPositions[p.w], jobPositions[p.j] ];
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geom, assignedLineMat);
      scene.add(line);
      edges.push(line);
    });
    document.getElementById('viz-message').textContent = "Optimal Assignment shown (green).";
    document.getElementById('show-assignment-btn').disabled = true;
  }

  function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  document.getElementById('show-assignment-btn').addEventListener('click', showAssignment);
  document.getElementById('reset-btn').addEventListener('click', ()=>{
    document.getElementById('show-assignment-btn').disabled = false;
    generateGraph();
  });

  window.addEventListener('load', initThree);
})();


/* ---------- 3. SMOOTH SCROLL SCRIPT ---------- */
document.querySelectorAll('.nav button, .cta').forEach(btn=>{
  btn.addEventListener('click', () => {
    const target = document.querySelector(btn.getAttribute('data-target'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});