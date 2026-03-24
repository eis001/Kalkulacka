/**
 * BackgroundAnimation — FloatingLines full-screen background
 * Vanilla JS port of react-bits FloatingLines
 * Uses Three.js (load from CDN before this script)
 */
(function () {
  'use strict';

  const VERTEX_SHADER = `
    precision highp float;
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const FRAGMENT_SHADER = `
    precision highp float;
    uniform float iTime;
    uniform vec3 iResolution;
    uniform float animationSpeed;
    uniform bool enableTop;
    uniform bool enableMiddle;
    uniform bool enableBottom;
    uniform int topLineCount;
    uniform int middleLineCount;
    uniform int bottomLineCount;
    uniform float topLineDistance;
    uniform float middleLineDistance;
    uniform float bottomLineDistance;
    uniform vec3 topWavePosition;
    uniform vec3 middleWavePosition;
    uniform vec3 bottomWavePosition;
    uniform vec2 iMouse;
    uniform bool interactive;
    uniform float bendRadius;
    uniform float bendStrength;
    uniform float bendInfluence;
    uniform bool parallax;
    uniform float parallaxStrength;
    uniform vec2 parallaxOffset;
    uniform vec3 lineGradient[8];
    uniform int lineGradientCount;

    mat2 rotate(float r) {
      return mat2(cos(r), sin(r), -sin(r), cos(r));
    }

    vec3 getLineColor(float t, vec3 baseColor) {
      if (lineGradientCount <= 0) return baseColor;
      vec3 gradientColor;
      if (lineGradientCount == 1) {
        gradientColor = lineGradient[0];
      } else {
        float clampedT = clamp(t, 0.0, 0.9999);
        float scaled = clampedT * float(lineGradientCount - 1);
        int idx = int(floor(scaled));
        float f = fract(scaled);
        int idx2 = min(idx + 1, lineGradientCount - 1);
        vec3 c1 = lineGradient[idx];
        vec3 c2 = lineGradient[idx2];
        gradientColor = mix(c1, c2, f);
      }
      return gradientColor * 0.55;
    }

    float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
      float time = iTime * animationSpeed;
      float x_offset = offset;
      float x_movement = time * 0.1;
      float amp = sin(offset + time * 0.2) * 0.28;
      float y = sin(uv.x + x_offset + x_movement) * amp;
      if (shouldBend) {
        vec2 d = screenUv - mouseUv;
        float influence = exp(-dot(d, d) * bendRadius);
        float bendOffset = (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
        y += bendOffset;
      }
      float m = uv.y - y;
      return 0.022 / max(abs(m) + 0.028, 1e-3) + 0.01;
    }

    vec3 darkGradient(vec2 uv) {
      float t = (uv.x + uv.y + 2.0) * 0.25;
      vec3 c1 = vec3(0.02, 0.031, 0.09);
      vec3 c2 = vec3(0.04, 0.059, 0.125);
      vec3 c3 = vec3(0.055, 0.043, 0.135);
      vec3 base = mix(mix(c1, c2, clamp(t * 2.2, 0.0, 1.0)), c3, clamp((t - 0.45) * 1.8, 0.0, 1.0));
      float rad = length(uv - vec2(0.0, 0.15));
      vec3 purpleGlow = vec3(0.235, 0.098, 0.353) * 0.15 * exp(-rad * 2.0);
      return base + purpleGlow;
    }

    void mainImage(out vec4 fragColor, in vec2 fragCoord) {
      vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
      baseUv.y *= -1.0;
      if (parallax) baseUv += parallaxOffset;
      vec3 col = darkGradient(baseUv);
      vec3 b = lineGradientCount > 0 ? vec3(0.0) : vec3(0.2);
      vec2 mouseUv = vec2(0.0);
      if (interactive) {
        mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
        mouseUv.y *= -1.0;
      }
      if (enableBottom) {
        for (int i = 0; i < bottomLineCount; ++i) {
          float fi = float(i);
          float t = fi / max(float(bottomLineCount - 1), 1.0);
          vec3 lineCol = getLineColor(t, b);
          float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
          vec2 ruv = baseUv * rotate(angle);
          col += lineCol * wave(ruv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y), 1.5 + 0.2 * fi, baseUv, mouseUv, interactive) * 0.28;
        }
      }
      if (enableMiddle) {
        for (int i = 0; i < middleLineCount; ++i) {
          float fi = float(i);
          float t = fi / max(float(middleLineCount - 1), 1.0);
          vec3 lineCol = getLineColor(t, b);
          float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
          vec2 ruv = baseUv * rotate(angle);
          col += lineCol * wave(ruv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y), 2.0 + 0.15 * fi, baseUv, mouseUv, interactive) * 0.75;
        }
      }
      if (enableTop) {
        for (int i = 0; i < topLineCount; ++i) {
          float fi = float(i);
          float t = fi / max(float(topLineCount - 1), 1.0);
          vec3 lineCol = getLineColor(t, b);
          float angle = topWavePosition.z * log(length(baseUv) + 1.0);
          vec2 ruv = baseUv * rotate(angle);
          ruv.x *= -1.0;
          col += lineCol * wave(ruv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y), 1.0 + 0.2 * fi, baseUv, mouseUv, interactive) * 0.22;
        }
      }
      fragColor = vec4(col, 1.0);
    }

    void main() {
      vec4 color = vec4(0.0);
      mainImage(color, gl_FragCoord.xy);
      gl_FragColor = color;
    }
  `;

  const MAX_GRADIENT_STOPS = 8;

  function parseColorToVec3(color) {
    const str = String(color).trim().toLowerCase();
    if (str.startsWith('rgba')) {
      const m = str.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/);
      if (m) {
        const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
        return new THREE.Vector3(parseInt(m[1], 10) / 255 * a, parseInt(m[2], 10) / 255 * a, parseInt(m[3], 10) / 255 * a);
      }
    }
    let value = str.startsWith('#') ? str.slice(1) : str;
    let r = 255, g = 255, b = 255;
    if (value.length === 3) {
      r = parseInt(value[0] + value[0], 16);
      g = parseInt(value[1] + value[1], 16);
      b = parseInt(value[2] + value[2], 16);
    } else if (value.length === 6) {
      r = parseInt(value.slice(0, 2), 16);
      g = parseInt(value.slice(2, 4), 16);
      b = parseInt(value.slice(4, 6), 16);
    }
    return new THREE.Vector3(r / 255, g / 255, b / 255);
  }

  function lerp(v, target, t) {
    v.x += (target.x - v.x) * t;
    v.y += (target.y - v.y) * t;
  }

  window.initBackgroundAnimation = function (containerEl, options) {
    if (typeof THREE === 'undefined') {
      console.error('BackgroundAnimation: Three.js is required. Load it before background-animation.js');
      return null;
    }

    options = options || {};
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return null;
    }

    const linesGradient = options.linesGradient || ['#4f7cff', '#e8e9ff', '#ff6a5f'];
    const animationSpeed = options.animationSpeed ?? 0.55;
    const bendRadius = options.bendRadius ?? 5;
    const bendStrength = options.bendStrength ?? -0.5;
    const mouseDamping = options.mouseDamping ?? 0.05;
    const parallax = options.parallax !== false;
    const parallaxStrength = options.parallaxStrength ?? 0.06;
    const interactive = options.interactive === true;
    const enabledWaves = options.enabledWaves || ['top', 'middle', 'bottom'];

    const topLineCount = enabledWaves.includes('top') ? 2 : 0;
    const middleLineCount = enabledWaves.includes('middle') ? 2 : 0;
    const bottomLineCount = enabledWaves.includes('bottom') ? 2 : 0;
    const topLineDistance = 0.08;
    const middleLineDistance = 0.07;
    const bottomLineDistance = 0.08;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' });
    renderer.setClearColor(0x050816, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    containerEl.appendChild(renderer.domElement);

    const targetMouse = new THREE.Vector2(-1000, -1000);
    const currentMouse = new THREE.Vector2(-1000, -1000);
    let targetInfluence = 0;
    let currentInfluence = 0;
    const targetParallax = { x: 0, y: 0 };
    const currentParallax = { x: 0, y: 0 };

    const gradientStops = linesGradient.slice(0, MAX_GRADIENT_STOPS).map(parseColorToVec3);
    const lineGradientArray = Array.from({ length: MAX_GRADIENT_STOPS }, (_, i) =>
      gradientStops[i] || new THREE.Vector3(1, 1, 1)
    );

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3(1, 1, 1) },
      animationSpeed: { value: animationSpeed },
      enableTop: { value: enabledWaves.includes('top') },
      enableMiddle: { value: enabledWaves.includes('middle') },
      enableBottom: { value: enabledWaves.includes('bottom') },
      topLineCount: { value: topLineCount },
      middleLineCount: { value: middleLineCount },
      bottomLineCount: { value: bottomLineCount },
      topLineDistance: { value: topLineDistance },
      middleLineDistance: { value: middleLineDistance },
      bottomLineDistance: { value: bottomLineDistance },
      topWavePosition: { value: new THREE.Vector3(10, 0.5, -0.4) },
      middleWavePosition: { value: new THREE.Vector3(5, 0, 0.2) },
      bottomWavePosition: { value: new THREE.Vector3(2, -0.7, 0.4) },
      iMouse: { value: new THREE.Vector2(-1000, -1000) },
      interactive: { value: interactive },
      bendRadius: { value: bendRadius },
      bendStrength: { value: bendStrength },
      bendInfluence: { value: 0 },
      parallax: { value: parallax },
      parallaxStrength: { value: parallaxStrength },
      parallaxOffset: { value: new THREE.Vector2(0, 0) },
      lineGradient: { value: lineGradientArray },
      lineGradientCount: { value: gradientStops.length }
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();

    function setSize() {
      const width = containerEl.clientWidth || 1;
      const height = containerEl.clientHeight || 1;
      renderer.setSize(width, height, false);
      const w = renderer.domElement.width;
      const h = renderer.domElement.height;
      uniforms.iResolution.value.set(w, h, 1);
    }
    setSize();

    let raf = 0;
    let active = true;

    const handlePointerMove = function (e) {
      const rect = containerEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dpr = renderer.getPixelRatio();
      targetMouse.set(x * dpr, (rect.height - y) * dpr);
      targetInfluence = 1;
      if (parallax) {
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        targetParallax.x = ((x - cx) / rect.width) * parallaxStrength;
        targetParallax.y = -((y - cy) / rect.height) * parallaxStrength;
      }
    };

    const handlePointerLeave = function () {
      targetInfluence = 0;
    };

    if (interactive) {
      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerleave', handlePointerLeave);
    }

    const renderLoop = function () {
      if (!active) return;
      uniforms.iTime.value = clock.getElapsedTime();
      if (interactive) {
        lerp(currentMouse, targetMouse, mouseDamping);
        uniforms.iMouse.value.copy(currentMouse);
        currentInfluence += (targetInfluence - currentInfluence) * mouseDamping;
        uniforms.bendInfluence.value = currentInfluence;
      }
      if (parallax) {
        currentParallax.x += (targetParallax.x - currentParallax.x) * mouseDamping;
        currentParallax.y += (targetParallax.y - currentParallax.y) * mouseDamping;
        uniforms.parallaxOffset.value.set(currentParallax.x, currentParallax.y);
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(setSize)
      : null;
    if (ro) ro.observe(containerEl);
    window.addEventListener('resize', setSize);

    return function destroy() {
      active = false;
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', setSize);
      if (interactive) {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerleave', handlePointerLeave);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  };
})();
