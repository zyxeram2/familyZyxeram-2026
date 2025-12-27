document.addEventListener('DOMContentLoaded', () => { 
    // --- CANVAS BACKGROUND ---
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.addEventListener('resize', resizeCanvas); resizeCanvas();
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2;
            this.speedX = (Math.random() - 0.5) * 0.2;
            this.speedY = (Math.random() - 0.5) * 0.2;
            this.opacity = Math.random() * 0.5;
        }
        update() {
            this.x += this.speedX; this.y += this.speedY;
            if(this.x < 0) this.x = canvas.width; if(this.x > canvas.width) this.x = 0;
            if(this.y < 0) this.y = canvas.height; if(this.y > canvas.height) this.y = 0;
        }
        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
        }
    }
    function initParticles() { particles = []; for(let i=0; i<100; i++) particles.push(new Particle()); }
    function animateParticles() { ctx.clearRect(0,0,canvas.width,canvas.height); particles.forEach(p=>{p.update();p.draw();}); requestAnimationFrame(animateParticles); }
    initParticles(); animateParticles();

    // --- ЛОГИКА ---
    const UNLOCK_DATE_UTC = new Date('2025-12-31T21:01:00.000Z');
    
    const curtain = document.getElementById('curtain');
    const curtainTitle = document.getElementById('curtainTitle');
    const navBar = document.getElementById('navBar');
    let currentScene = 'scene-start';

    // 1. Navigation
    function switchScene(targetId) {
        if(targetId === currentScene) return;
        const titles = { 'scene-album': 'Глава I: Хроника', 'scene-tree': 'Глава II: Секреты', 'scene-fortune': 'Глава III: Оракул', 'scene-interview': 'Глава IV: Интервью', 'scene-gallery': 'Глава V: Взгляд', 'scene-capsule': 'Финал: Вечность' };
        curtainTitle.textContent = titles[targetId] || 'Загрузка...';
        curtain.classList.add('active');
        setTimeout(() => {
            document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
            if(targetId !== 'scene-start' && targetId !== 'scene-intro') navBar.classList.remove('hidden');
            else navBar.classList.add('hidden');
            document.querySelectorAll('.nav-links button').forEach(btn => { btn.classList.toggle('active', btn.dataset.target === targetId); });
            window.scrollTo(0,0); currentScene = targetId;
            setTimeout(() => curtain.classList.remove('active'), 800);
        }, 800);
    }
    document.querySelectorAll('[data-target], [data-next]').forEach(btn => { btn.addEventListener('click', () => switchScene(btn.dataset.target || btn.dataset.next)); });
    document.getElementById('startBtn').addEventListener('click', () => { switchScene('scene-intro'); playIntro(); });
    document.getElementById('navHomeBtn').addEventListener('click', () => switchScene('scene-start'));
    document.getElementById('skipIntroBtn').addEventListener('click', () => switchScene('scene-album'));

    // 2. Intro
    function playIntro() {
        const container = document.getElementById('creditsContainer'); 
        container.innerHTML = ''; 
        let delay = 500;
        const credits = AppData.credits || ["С новым годом!", "Семья 2026"];
        credits.forEach(text => {
            const slide = document.createElement('div'); 
            slide.className = 'credit-slide'; 
            slide.textContent = text;
            container.appendChild(slide);
            setTimeout(() => slide.classList.add('visible'), delay); 
            setTimeout(() => slide.classList.remove('visible'), delay + 2500); 
            delay += 3000;
        });
        setTimeout(() => { if(currentScene === 'scene-intro') switchScene('scene-album'); }, delay);
    }

    // 3. Album
    const timeline = document.getElementById('albumTimeline');
    if (timeline) {
        timeline.innerHTML = '<div class="timeline-line"></div>'; 
        AppData.album.forEach((item, index) => {
            const card = document.createElement('div'); card.className = 'month-card'; 
            // Убрали смещение (marginLeft), чтобы иконки ровно попадали на линию
            card.innerHTML = `
<div class="month-header"><span>${item.month}</span><h3>${item.title}</h3></div><img src="${item.src}" class="month-img" loading="lazy"><p>${item.desc}</p>`;
            timeline.appendChild(card);
        });
        const observer = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('in-view'); }), { threshold: 0.15 });
        document.querySelectorAll('.month-card').forEach(el => observer.observe(el));
    }

    // 4. Tree
    const treeLayer = document.getElementById('ornamentsLayer');
    if (treeLayer) {
        treeLayer.innerHTML = ''; 
        AppData.ornaments.forEach((orn, i) => {
            const el = document.createElement('div'); el.className = 'ornament';
            el.style.top = orn.pos[0] + '%'; el.style.left = orn.pos[1] + '%';
            const colors = ['#ff0000', '#gold', '#0000ff', '#silver'];
            el.style.background = `radial-gradient(circle at 30% 30%, white, ${colors[i % 4]})`;
            el.addEventListener('click', () => showModal(orn.title, orn.content, orn.image)); treeLayer.appendChild(el);
        });
    }

    // 5. Fortune
    const cardsTable = document.getElementById('cardsTable');
    const personaSelect = document.getElementById('fortunePersona');
    if (personaSelect) {
        personaSelect.innerHTML = ''; 
        AppData.characters.forEach(char => {
            const opt = document.createElement('option'); opt.value = char.id; opt.textContent = char.name; personaSelect.appendChild(opt);
        });
    }
    function dealCards() {
        if (!cardsTable) return;
        cardsTable.innerHTML = ''; 
        document.getElementById('predictionResult').classList.add('hidden');
        for(let i=0; i<3; i++) {
            const card = document.createElement('div'); card.className = 'card'; card.innerHTML = `<div class="card-back">🔮</div>`;
            card.addEventListener('click', () => {
                if(card.classList.contains('flipped')) return; card.classList.add('flipped');
                const pool = AppData.fortunePool.default; const prediction = pool[Math.floor(Math.random() * pool.length)];
                setTimeout(() => {
                    document.getElementById('predTitle').textContent = `Для: ${personaSelect.options[personaSelect.selectedIndex].text}`;
                    document.getElementById('predText').textContent = prediction;
                    document.getElementById('predictionResult').classList.remove('hidden');
                }, 600);
            });
            cardsTable.appendChild(card);
        }
    }
    dealCards(); 
    if (document.getElementById('resetFortuneBtn')) document.getElementById('resetFortuneBtn').addEventListener('click', dealCards);

    // 6. Interview (FIXED: PAUSE BG MUSIC)
    const interviewGrid = document.getElementById('interviewGrid');
    if (interviewGrid) {
        interviewGrid.innerHTML = ''; 
        AppData.interviews.forEach(person => {
            const slot = document.createElement('div'); slot.className = 'video-slot';
            slot.innerHTML = `<img src="${person.placeholder}" class="video-thumb"><div class="video-play-icon">▶</div><div class="video-label">${person.name}</div>`;
            slot.addEventListener('click', () => {
                // ПАУЗА ФОНОВОЙ МУЗЫКИ ПРИ ОТКРЫТИИ ВИДЕО
                if (bgMusic && isMusicPlaying) {
                    bgMusic.pause();
                    // Не меняем isMusicPlaying на false, чтобы знать, что она была включена и восстановить её
                }

                const content = person.video ? `<video id="activeInterviewVideo" src="${person.video}" controls autoplay playsinline style="width:100%; max-height:70vh; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.5);"></video>` : `<p style="text-align:center; padding:20px;">Видео пока не загружено...</p>`;
                showModal(`Интервью: ${person.name}`, content);
            });
            interviewGrid.appendChild(slot);
        });
    }

    // 7. Gallery
    const galleryTrack = document.getElementById('galleryTrack');
    let galleryIndex = 0;
    function initGallery() {
        if (!galleryTrack || !AppData.galleryPhotos) return;
        galleryTrack.innerHTML = ''; 
        AppData.galleryPhotos.forEach((src, i) => {
            const slide = document.createElement('div'); slide.className = 'gallery-slide';
            slide.innerHTML = `<img src="${src}" draggable="false">`;
            slide.addEventListener('click', () => updateGallery(i)); galleryTrack.appendChild(slide);
        });
        updateGallery(0);
    }
    function updateGallery(index) {
        galleryIndex = index; const slides = document.querySelectorAll('.gallery-slide');
        slides.forEach((slide, i) => {
            slide.className = 'gallery-slide'; const diff = i - galleryIndex;
            if (diff === 0) slide.classList.add('active'); else if (diff === -1) slide.classList.add('prev'); else if (diff === 1) slide.classList.add('next'); else if (diff < -1) slide.classList.add('hidden-left'); else if (diff > 1) slide.classList.add('hidden-right');
        });
    }
    const galleryPrevBtn = document.getElementById('galleryPrev'); const galleryNextBtn = document.getElementById('galleryNext');
    if (galleryPrevBtn) galleryPrevBtn.addEventListener('click', () => { if (galleryIndex > 0) updateGallery(galleryIndex - 1); });
    if (galleryNextBtn) galleryNextBtn.addEventListener('click', () => { if (galleryIndex < AppData.galleryPhotos.length - 1) updateGallery(galleryIndex + 1); });
    if (galleryTrack) {
        let touchStartX = 0; galleryTrack.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX);
        galleryTrack.addEventListener('touchend', e => {
            const touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 50 && galleryIndex < AppData.galleryPhotos.length - 1) updateGallery(galleryIndex + 1);
            if (touchEndX > touchStartX + 50 && galleryIndex > 0) updateGallery(galleryIndex - 1);
        });
    }
    initGallery();


    // 8. CAPSULE
    let capsuleData = (typeof BOX_WISHES !== 'undefined' && Array.isArray(BOX_WISHES)) ? BOX_WISHES : [];
    const lockedView = document.getElementById('capsuleLocked');
    const unlockedView = document.getElementById('capsuleUnlocked');
    const recipientSelector = document.getElementById('recipientSelector');
    const letterReader = document.getElementById('letterReader');
    const recipientsGrid = document.getElementById('recipientsGrid');
    const letterContent = document.getElementById('letterContent');
    const backToSelectorBtn = document.getElementById('backToSelectorBtn');

    function initCapsuleInterface() {
        recipientsGrid.innerHTML = '';
        const lettersByPerson = {};
        capsuleData.forEach(letter => {
            if(!lettersByPerson[letter.to]) lettersByPerson[letter.to] = [];
            lettersByPerson[letter.to].push(letter);
        });

        AppData.characters.forEach(char => {
            const letters = lettersByPerson[char.name];
            if (letters && letters.length > 0) {
                const card = document.createElement('div');
                card.className = 'recipient-card';
                card.innerHTML = `
                    <div class="recipient-icon">${char.name.charAt(0)}</div>
                    <div class="recipient-name">${char.name}</div>
                    <div class="recipient-count">${letters.length} 💌</div>
                `;
                card.addEventListener('click', () => openLetter(char.name, letters));
                recipientsGrid.appendChild(card);
            }
        });
    }

    function openLetter(name, letters) {
        recipientSelector.classList.add('hidden');
        letterReader.classList.remove('hidden');
        let html = '';
        letters.forEach(l => {
            html += `<div class="single-wish">${l.text}</div>`;
        });
        letterContent.innerHTML = html;
    }

    if (backToSelectorBtn) {
        backToSelectorBtn.addEventListener('click', () => {
            letterReader.classList.add('hidden');
            recipientSelector.classList.remove('hidden');
        });
    }

    // DEBUG BUTTON
    const capsuleContainer = document.querySelector('.capsule-glass');
    if (capsuleContainer) {
        const debugBtn = document.createElement('button');
        debugBtn.innerHTML = '🔒';
        debugBtn.style.cssText = 'position:absolute; top:15px; right:15px; background:none; border:none; font-size:1.2rem; opacity:0.3; cursor:pointer; z-index:100; filter:grayscale(1);';
        
        debugBtn.addEventListener('click', () => {
            const currentState = localStorage.getItem('capsuleUnlocked') === 'true';
            if (currentState) {
                localStorage.removeItem('capsuleUnlocked');
                alert('Режим: Закрыто');
                debugBtn.innerHTML = '🔒';
            } else {
                localStorage.setItem('capsuleUnlocked', 'true');
                alert('Режим: Открыто (Тест)');
                debugBtn.innerHTML = '🔓';
            }
            updateTimer();
        });
        capsuleContainer.appendChild(debugBtn);
    }

    function updateTimer() {
        const now = new Date();
        const diff = UNLOCK_DATE_UTC - now;
        const manualUnlock = localStorage.getItem('capsuleUnlocked') === 'true';

        if(diff <= 0 || manualUnlock) {
            if(!lockedView.classList.contains('hidden')) {
                lockedView.classList.add('hidden');
                unlockedView.classList.remove('hidden');
                initCapsuleInterface(); 
            }
        } else {
            lockedView.classList.remove('hidden');
            unlockedView.classList.add('hidden');
            const d = Math.floor(diff / (1000*60*60*24));
            const h = Math.floor((diff % (1000*60*60*24))/(1000*60*60));
            const m = Math.floor((diff % (1000*60*60))/(1000*60));
            const s = Math.floor((diff % (1000*60))/1000);
            document.getElementById('days').textContent = String(d).padStart(2,'0');
            document.getElementById('hours').textContent = String(h).padStart(2,'0');
            document.getElementById('minutes').textContent = String(m).padStart(2,'0');
            document.getElementById('seconds').textContent = String(s).padStart(2,'0');
        }
    }
    setInterval(updateTimer, 1000); 
    setTimeout(updateTimer, 100);

    // Audio
    const soundBtn = document.getElementById('soundToggle');
    let bgMusic = null; let isMusicPlaying = false;
    function initMusic() { if (bgMusic) return; if (!AppData.music) return; bgMusic = new Audio(AppData.music); bgMusic.loop = true; bgMusic.volume = 0.4; }
    function toggleMusic() { if (!bgMusic) initMusic(); if (!bgMusic) return; if (isMusicPlaying) { bgMusic.pause(); isMusicPlaying = false; soundBtn.textContent = '🔇'; soundBtn.style.opacity = '0.5'; } else { bgMusic.play().then(() => { isMusicPlaying = true; soundBtn.textContent = '🔊'; soundBtn.style.opacity = '1'; }).catch(err => console.log('Audio blocked:', err)); } }
    if (soundBtn) soundBtn.addEventListener('click', toggleMusic);
    const startBtnOriginal = document.getElementById('startBtn'); if (startBtnOriginal) { startBtnOriginal.addEventListener('click', () => { if (!isMusicPlaying) toggleMusic(); }); }
    
    // MODAL (FIXED: PAUSE VIDEO & RESUME BG)
    const modal = document.getElementById('modalOverlay'); 
    const closeBtn = document.querySelector('.close-modal');
    
    function showModal(title, content, img) { 
        const imgHtml = img ? `<img src="${img}" style="width:100%; border-radius:12px; margin-bottom:15px; border:1px solid var(--gold);">` : ''; 
        document.getElementById('modalBody').innerHTML = `${imgHtml}<h3>${title}</h3><div style="margin-top:10px">${content}</div>`; 
        modal.classList.remove('hidden'); 
    }

    function closeModal() {
        // 1. Пауза видео в модалке (если есть)
        const videoInModal = document.getElementById('activeInterviewVideo');
        if (videoInModal) {
            videoInModal.pause();
        }
        // Очищаем контент модалки, чтобы видео точно удалилось из DOM
        setTimeout(() => { document.getElementById('modalBody').innerHTML = ''; }, 300);

        // 2. Восстановление музыки (если была включена)
        if (bgMusic && isMusicPlaying) {
            bgMusic.play().catch(e => console.log('Resume blocked', e));
        }

        modal.classList.add('hidden');
    }

    [modal, closeBtn].forEach(el => el.addEventListener('click', (e) => { 
        if(e.target === modal || e.target === closeBtn) closeModal(); 
    }));
});
