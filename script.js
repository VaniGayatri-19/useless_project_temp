// Starfield background
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const stars = Array.from({ length: 150 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 1.2 + 0.3,
  speed: Math.random() * 0.15 + 0.02
}));

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#F2F0FA';
  stars.forEach(star => {
    ctx.globalAlpha = Math.random() * 0.5 + 0.5;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
    star.y += star.speed;
    if (star.y > canvas.height) star.y = 0;
  });
  requestAnimationFrame(drawStars);
}
drawStars();

// Button — placeholder for now, Step 4 will add the real animation
document.getElementById('splitBtn').addEventListener('click', () => {
  const decision = document.getElementById('decision').value.trim();
  if (!decision) {
    alert('Enter a decision first!');
    return;
  }
  console.log('Decision entered:', decision);
  alert('Reality splitting coming in the next step 🔮');
});