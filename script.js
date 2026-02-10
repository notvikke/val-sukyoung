const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const mainImage = document.getElementById('main-image');
const questionText = document.getElementById('question');
const card = document.querySelector('.card');
const gallery = document.getElementById('gallery');
const shiroHelper = document.getElementById('shiro-helper');
const musicBtn = document.getElementById('music-toggle');
const bgMusic = document.getElementById('bg-music');

const chaosTexts = [
    "No",
    "Really?",
    "Thinking again?",
    "Action Beam!",
    "Sukyoung plz",
    "Why not?",
    "Click Yes!",
    "😢"
];

const evilEmojis = ['😈', '🍑', '👺', '💢', '💔'];

let noAttempts = 0;
let currentScale = 1;

// Load sounds
// Using a placeholder beep for now since we don't have a reliable audio asset URL yet.
// In a real scenario, we'd replace this with a real audio file.
const successSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'); // Simple chime

// Chaos Mode Logic
const moveNoButton = () => {
    // 1. Move to body to avoid container clipping/relative positioning issues
    if (noBtn.parentNode !== document.body) {
        document.body.appendChild(noBtn);
        noBtn.style.zIndex = '1000'; // Ensure visibility
    }

    noAttempts++;

    // Shiro Helper Logic
    if (noAttempts > 3) {
        shiroHelper.classList.remove('hidden');
        shiroHelper.classList.add('visible');
    }

    // 1. Random cycling text
    const randomText = chaosTexts[Math.floor(Math.random() * chaosTexts.length)];
    noBtn.innerText = randomText;

    // 2. Shrink button
    if (currentScale > 0.6) { // Don't shrink too much
        currentScale -= 0.1;
        noBtn.style.transform = `scale(${currentScale})`;
    }

    // 3. Jump to random position with padding
    const padding = 20; // Keep away from edges
    const maxX = window.innerWidth - noBtn.offsetWidth - padding;
    const maxY = window.innerHeight - noBtn.offsetHeight - padding;

    // Ensure we don't get negative values
    const safeMaxX = Math.max(0, maxX);
    const safeMaxY = Math.max(0, maxY);

    const randomX = Math.random() * safeMaxX + (padding / 2);
    const randomY = Math.random() * safeMaxY + (padding / 2);

    noBtn.style.position = 'fixed';
    noBtn.style.left = `${randomX}px`;
    noBtn.style.top = `${randomY}px`;

    // 4. Shake animation
    noBtn.classList.remove('shake');
    void noBtn.offsetWidth; // Trigger reflow
    noBtn.classList.add('shake');

    // 5. Spawn floating emojis
    spawnEmojis(noBtn.getBoundingClientRect());
};

const spawnEmojis = (rect) => {
    const emoji = document.createElement('div');
    emoji.innerText = evilEmojis[Math.floor(Math.random() * evilEmojis.length)];
    emoji.classList.add('floating-emoji');

    emoji.style.left = `${rect.left + rect.width / 2}px`;
    emoji.style.top = `${rect.top}px`;

    document.body.appendChild(emoji);

    setTimeout(() => {
        emoji.remove();
    }, 1000);
};

// Yes Button Logic
const celebrate = () => {
    // 1. Confetti
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff4081', '#40c4ff', '#ffd740']
    });

    // 2. Play Sound
    successSound.play().catch(e => console.log("Audio play failed (user interaction needed first)", e));

    // 3. UI Swap
    mainImage.src = 'happy_shinchan.png';
    questionText.innerText = 'Yay! Love you, 수경! 💖';

    // Hide buttons
    document.querySelector('.buttons').style.display = 'none';

    // Clean up "No" button if it's floating around
    noBtn.style.display = 'none';

    // Continuous confetti for a few seconds
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#ff4081', '#40c4ff']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#ff4081', '#40c4ff']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());

    // 4. Show "View Memories" button
    const viewMemoriesBtn = document.getElementById('view-memories-btn');
    viewMemoriesBtn.classList.remove('hidden');
    viewMemoriesBtn.classList.add('visible');
};

// Gallery Logic
const viewMemoriesBtn = document.getElementById('view-memories-btn');
const closeGalleryBtn = document.getElementById('close-gallery-btn');

viewMemoriesBtn.addEventListener('click', () => {
    gallery.classList.remove('hidden');
    gallery.classList.add('visible');
    // Optional: Hide the button when gallery is open? Or keep it? 
    // User said "appear only after pressing a button". 
    // Let's keep the button visible or hide it? Typically hide to reduce clutter.
    // viewMemoriesBtn.style.display = 'none'; // logic if desired, but toggle is better
});

closeGalleryBtn.addEventListener('click', () => {
    gallery.classList.remove('visible');
    gallery.classList.add('hidden');
    // viewMemoriesBtn.style.display = 'block'; // logic if hidden above
});

noBtn.addEventListener('mouseover', moveNoButton);
noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent click
    moveNoButton();
});
noBtn.addEventListener('click', moveNoButton); // Fallback

yesBtn.addEventListener('click', celebrate);

// Music Toggle Logic
let isPlaying = false;

const toggleMusic = () => {
    if (isPlaying) {
        bgMusic.pause();
        musicBtn.style.opacity = '0.5';
    } else {
        bgMusic.play().catch(e => console.log("Audio play failed", e));
        musicBtn.style.opacity = '1';
    }
    isPlaying = !isPlaying;
};

musicBtn.addEventListener('click', toggleMusic);

// Try to autoplay on load
bgMusic.volume = 0.5; // Set volume to 50%
bgMusic.play().then(() => {
    isPlaying = true;
    musicBtn.style.opacity = '1';
}).catch(error => {
    console.log("Autoplay blocked. Waiting for interaction.");
    // Fallback: Play on first interaction
    const playOnInteraction = () => {
        bgMusic.play().then(() => {
            isPlaying = true;
            musicBtn.style.opacity = '1';
            document.body.removeEventListener('click', playOnInteraction);
        });
    };
    document.body.addEventListener('click', playOnInteraction);
});
