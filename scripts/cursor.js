'use strict';

(function () {
  const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!pointerQuery.matches || !window.requestAnimationFrame) return;

  const SVG_NS = 'http://www.w3.org/2000/svg';

  const cursor = document.createElementNS(SVG_NS, 'svg');
  cursor.classList.add('tc-cursor');
  cursor.setAttribute('aria-hidden', 'true');
  cursor.setAttribute('viewBox', '0 0 42 42');
  cursor.setAttribute('focusable', 'false');

  const core = document.createElementNS(SVG_NS, 'path');
  core.classList.add('tc-cursor__core');
  core.setAttribute('d', 'M21 9C27.6 9 33 14.4 33 21S27.6 33 21 33 9 27.6 9 21 14.4 9 21 9Z');

  cursor.appendChild(core);
  document.body.appendChild(cursor);

  let x = 0;
  let y = 0;

  let previousX = 0;
  let previousY = 0;

  let velocity = 0;
  let rotation = 0;
  let targetRotation = 0;
  let blobPhase = 0;

  let active = false;
  let hasPosition = false;
  let framePending = false;

  let lastTime = performance.now();

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function updatePointer(event) {
    if (
      event.pointerType &&
      event.pointerType !== 'mouse' &&
      event.pointerType !== 'pen'
    ) {
      return;
    }

    x = event.clientX;
    y = event.clientY;
    hasPosition = true;

    if (!active) {
      previousX = x;
      previousY = y;
      active = true;
      cursor.classList.add('is-visible');
    }

    const deltaX = x - previousX;
    const deltaY = y - previousY;

    const distance = Math.sqrt(
      deltaX * deltaX + deltaY * deltaY
    );

    if (distance > 0.01) {
      targetRotation =
        Math.atan2(deltaY, deltaX) * 180 / Math.PI + 45;

      velocity = clamp(distance * 2.4, 0, 72);
    }

    previousX = x;
    previousY = y;

    scheduleFrame();
  }

  function handleWindowBlur() {
    active = false;
    cursor.classList.remove('is-visible');
  }

  function handleWindowFocus() {
    if (!hasPosition) return;

    active = true;
    cursor.classList.add('is-visible');

    scheduleFrame();
  }

  function scheduleFrame() {
    if (framePending) return;

    framePending = true;
    requestAnimationFrame(render);
  }

  function updateBlob(motion) {
    const points = [];
    const pointCount = 12;
    const idleMotion = 0.16 + Math.sin(blobPhase * 0.65) * 0.035;
    const blobMotion = Math.max(motion, idleMotion);
    const stretch = 1 + motion * 1.35 + idleMotion * 0.08;
    const squash = 1 - motion * 0.42 - idleMotion * 0.025;

    for (let index = 0; index < pointCount; index += 1) {
      const angle = (Math.PI * 2 * index) / pointCount;
      const directionalPush = Math.cos(angle) * motion * 3.2;
      const ripple =
        Math.sin(angle * 3 + blobPhase) * blobMotion * 1.8 +
        Math.sin(angle * 2 - blobPhase * 0.7) * blobMotion * 0.9;
      const radius = 12 + directionalPush + ripple;

      points.push({
        x: 21 + Math.cos(angle) * radius * stretch,
        y: 21 + Math.sin(angle) * radius * squash
      });
    }

    let path = '';
    for (let index = 0; index < pointCount; index += 1) {
      const current = points[index];
      const next = points[(index + 1) % pointCount];
      const midpointX = (current.x + next.x) / 2;
      const midpointY = (current.y + next.y) / 2;

      if (index === 0) {
        path = `M ${midpointX.toFixed(2)} ${midpointY.toFixed(2)}`;
      }

      path +=
        ` Q ${current.x.toFixed(2)} ${current.y.toFixed(2)} ` +
        `${midpointX.toFixed(2)} ${midpointY.toFixed(2)}`;
    }

    path += ' Z';
    core.setAttribute('d', path);
  }

  function render(now) {
    framePending = false;

    const elapsed = Math.min(32, now - lastTime);
    lastTime = now;

    // Smooth rotation
    const angleDelta =
      ((targetRotation - rotation + 540) % 360) - 180;

    rotation +=
      angleDelta *
      (1 - Math.pow(0.0001, elapsed / 1000));

    // Velocity decay
    const decay = Math.pow(0.001, elapsed / 1000);
    velocity *= decay;

    // Very subtle uniform scale.
    // This prevents the SVG from becoming distorted.
    const motion = velocity / 72;
    const scale = 1 + motion * 0.035;
    blobPhase += elapsed * 0.012;
    updateBlob(motion);

    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;

    cursor.style.transform =
      `translate3d(-50%, -50%, 0) ` +
      `rotate(${rotation.toFixed(2)}deg) ` +
      `scale(${scale.toFixed(3)})`;

    if (active) {
      scheduleFrame();
    }
  }

  document.addEventListener(
    'pointermove',
    updatePointer,
    { passive: true }
  );

  window.addEventListener('blur', handleWindowBlur);
  window.addEventListener('focus', handleWindowFocus);

  pointerQuery.addEventListener('change', function (event) {
    if (!event.matches) {
      cursor.remove();
    }
  });
})();