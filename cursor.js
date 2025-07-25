window.addEventListener('DOMContentLoaded', () => {
  const follower = document.getElementById('follower');

  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    follower.style.display = 'none';
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  let currentX = mouseX;
  let currentY = mouseY;

  let lastX = currentX;
  let lastY = currentY;

  let currentAngle = 0;

  const delay = 0.15;
  const rotationSmoothing = 0.1;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function angleLerp(a, b, t) {
    let delta = b - a;
    delta = ((delta + 180) % 360) - 180;
    return a + delta * t;
  }

  function updateFollower() {
    const dx = mouseX - currentX;
    const dy = mouseY - currentY;

    currentX += dx * delay;
    currentY += dy * delay;

    const vx = currentX - lastX;
    const vy = currentY - lastY;

    let targetAngle = Math.atan2(vy, vx) * (180 / Math.PI);
    currentAngle = angleLerp(currentAngle, targetAngle, rotationSmoothing);

    follower.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%) rotate(${currentAngle}deg)`;

    lastX = currentX;
    lastY = currentY;

    requestAnimationFrame(updateFollower);
  }

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  updateFollower();
});
