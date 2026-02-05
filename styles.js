  document.addEventListener("DOMContentLoaded", () => {

  
  // --- Floating hearts background ---
    const heartsWrap = document.getElementById('hearts');
    function spawnHearts(count = 26){
      heartsWrap.innerHTML = '';
      for(let i=0;i<count;i++){
        const h = document.createElement('div');
        h.className = 'heart';
        const left = Math.random()*100;
        const size = 10 + Math.random()*18;
        const dur = 6 + Math.random()*10;
        const delay = Math.random()*-dur; // negative delay so it starts mid-animation
        h.style.left = left + 'vw';
        h.style.width = size + 'px';
        h.style.height = size + 'px';
        h.style.animationDuration = dur + 's';
        h.style.animationDelay = delay + 's';
        h.style.opacity = (0.25 + Math.random()*0.55).toFixed(2);
        // randomize pink shades slightly
        const shade = 120 + Math.floor(Math.random()*60);
        h.style.background = `hsl(${shade}, 100%, 75%)`;
        heartsWrap.appendChild(h);
      }
    }
    spawnHearts();

    // --- Sound (simple beeps using WebAudio, no external files) ---
    let soundOn = true;
    const soundToggle = document.getElementById('soundToggle');
    const soundLabel = document.getElementById('soundLabel');

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = AudioCtx ? new AudioCtx() : null;

    function beep(freq=660, time=0.07, type='sine', vol=0.05){
      if(!soundOn || !ctx) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = vol;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + time);
    }

    soundToggle.addEventListener('click', async ()=>{
      soundOn = !soundOn;
      soundLabel.textContent = soundOn ? 'On' : 'Off';
      beep(soundOn ? 740 : 220, 0.08, 'triangle', 0.06);
      if(ctx && ctx.state === 'suspended') await ctx.resume();
    });

    // --- Runaway NO button logic ---
    const noBtn = document.getElementById('noBtn');
    const yesBtn = document.getElementById('yesBtn');
    const buttonArea = document.getElementById('buttonArea');
    const noteText = document.getElementById('noteText');

    let noCount = 0;
function moveNoButton(){
  noBtn.style.position = 'absolute';

  const areaRect = buttonArea.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const padding = 8;

  const maxX = Math.max(padding, areaRect.width - btnRect.width - padding);
  const maxY = Math.max(padding, areaRect.height - btnRect.height - padding);

  const x = padding + Math.random() * (maxX - padding);
  const y = padding + Math.random() * (maxY - padding);

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

    function updateTeasing(){
      const lines = [
        "No button is running away… 🏃‍♂️💨",
        "Pookie… it’s okay to press YES 😭💖",
        "Plot twist: the NO button doesn’t exist 😌",
        "Your finger slipped… towards YES ✨",
        "I’m not saying YES is correct… but YES is correct 😌💘",
        "Okay okay, last chance for NO (just kidding) 😂",
      ];
      noteText.textContent = lines[Math.min(noCount, lines.length-1)];
    }

    // For mobile: on tap, it moves. For desktop: hover moves too.
    noBtn.addEventListener('mouseenter', ()=>{
      noCount++;
      moveNoButton();
      updateTeasing();
      beep(420 + noCount*40, 0.06, 'square', 0.04);
      // make YES slightly bigger each time
      const scale = 1 + Math.min(noCount*0.04, 0.35);
      yesBtn.style.transform = `translateY(-1px) scale(${scale})`;
    });

    noBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      noCount++;
      moveNoButton();
      updateTeasing();
      beep(360 + noCount*35, 0.07, 'square', 0.05);
      const scale = 1 + Math.min(noCount*0.05, 0.45);
      yesBtn.style.transform = `translateY(-1px) scale(${scale})`;
    });

    // --- Confetti (simple canvas) ---
    const canvas = document.getElementById('confetti');
    const c = canvas.getContext('2d');
    let confetti = [];
    let confettiRunning = false;

    function resize(){
      canvas.width = innerWidth;
      canvas.height = innerHeight;
    }
    addEventListener('resize', resize);
    resize();

    function burstConfetti(){
      const pieces = 160;
      confetti = [];
      for(let i=0;i<pieces;i++){
        confetti.push({
          x: Math.random()*canvas.width,
          y: -20 - Math.random()*canvas.height*0.2,
          r: 3 + Math.random()*5,
          vy: 2 + Math.random()*5,
          vx: -2 + Math.random()*4,
          rot: Math.random()*Math.PI,
          vr: -0.2 + Math.random()*0.4,
          // random color without specifying palette too strictly
          col: `hsl(${Math.floor(Math.random()*360)}, 95%, 65%)`
        });
      }
      confettiRunning = true;
      requestAnimationFrame(tick);
    }

    function tick(){
      if(!confettiRunning) return;
      c.clearRect(0,0,canvas.width,canvas.height);
      confetti.forEach(p=>{
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        c.save();
        c.translate(p.x,p.y);
        c.rotate(p.rot);
        c.fillStyle = p.col;
        c.fillRect(-p.r, -p.r, p.r*2, p.r*2.6);
        c.restore();
      });
      // remove pieces offscreen
      confetti = confetti.filter(p => p.y < canvas.height + 40);
      if(confetti.length){
        requestAnimationFrame(tick);
      }else{
        confettiRunning = false;
        c.clearRect(0,0,canvas.width,canvas.height);
      }
    }

    // --- YES button: show modal + confetti + cute message copy ---
    const modal = document.getElementById('modal');
    const closeBtn = document.getElementById('closeBtn');
    const shareBtn = document.getElementById('shareBtn');

    function openModal(){
      modal.classList.add('show');
    }
    function closeModal(){
      modal.classList.remove('show');
    }

    yesBtn.addEventListener('click', async ()=>{
      if(ctx && ctx.state === 'suspended') await ctx.resume();
      beep(660, 0.08, 'triangle', 0.07);
      beep(880, 0.10, 'sine', 0.06);
      burstConfetti();
      openModal();
    });

    closeBtn.addEventListener('click', ()=>{ beep(300,0.06,'triangle',0.05); closeModal(); });
    modal.addEventListener('click', (e)=>{
      if(e.target === modal) closeModal();
    });

    shareBtn.addEventListener('click', async ()=>{
      const msg = "Pookie said YES 💖🥹 Date idea: walk + snacks + movie + dessert. Best Valentine ever!";
      try{
        await navigator.clipboard.writeText(msg);
        shareBtn.textContent = "Copied! 💘";
        beep(740,0.06,'sine',0.07);
        setTimeout(()=> shareBtn.textContent = "Copy a cute message 💌", 1600);
      }catch{
        alert(msg);
      }
    });

    // initial playful positioning for NO on small screens
    setTimeout(()=> {
      if(innerWidth < 520) moveNoButton();
    }, 350);

    });