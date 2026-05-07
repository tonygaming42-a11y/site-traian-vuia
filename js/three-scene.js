(function () {
  window.initThreeScene = function initThreeScene() {
    if (typeof window.__tveThreeCleanup === 'function') {
      window.__tveThreeCleanup();
      window.__tveThreeCleanup = null;
    }

    const canvas = document.getElementById('three-canvas');
    const heroSection = document.getElementById('home');
    if (!canvas || !heroSection || !window.THREE) {
      console.warn('Three.js scene was not initialized because canvas or THREE is unavailable.');
      return;
    }

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const mouse = { x: 0, y: 0 };
    let heroScrollProgress = 0;
    let globalSkyProgress = 0;
    const disposables = [];
    const BASE_CAMERA_POSITION = new THREE.Vector3(0, isMobile ? 1.5 : 1.8, isMobile ? 9.2 : 8.3);
    const FLIGHT_CENTER = new THREE.Vector3(0, 1.5, -4.2);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1b2637, isMobile ? 0.03 : 0.022);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 320);
    camera.position.copy(BASE_CAMERA_POSITION);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(heroSection.clientWidth, heroSection.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const ambient = new THREE.AmbientLight(0x87ceeb, 0.6);
    const key = new THREE.DirectionalLight(0xfff4e0, 2);
    key.position.set(12, 14, 9);
    key.castShadow = true;
    key.shadow.mapSize.set(isMobile ? 1024 : 1536, isMobile ? 1024 : 1536);
    key.shadow.camera.left = -18;
    key.shadow.camera.right = 18;
    key.shadow.camera.top = 18;
    key.shadow.camera.bottom = -18;
    scene.add(ambient, key);

    const skyUniforms = {
      nightColor: { value: new THREE.Color(0x080b1c) },
      dawnColor: { value: new THREE.Color(0xe8572a) },
      dayColor: { value: new THREE.Color(0x4da3ff) },
      horizonWarm: { value: new THREE.Color(0xffb36c) },
      progress: { value: 0 }
    };

    const skyDome = new THREE.Mesh(
      new THREE.SphereGeometry(190, isMobile ? 28 : 48, isMobile ? 14 : 28),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: skyUniforms,
        vertexShader: 'varying vec3 vPos; void main(){ vPos = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader:
          'uniform vec3 nightColor; uniform vec3 dawnColor; uniform vec3 dayColor; uniform vec3 horizonWarm; uniform float progress; varying vec3 vPos; void main(){ float h = clamp((vPos.y + 1.0) * 0.5, 0.0, 1.0); float dawnMix = smoothstep(0.12, 0.55, progress); float dayMix = smoothstep(0.45, 0.95, progress); vec3 base = mix(nightColor, dawnColor, dawnMix); base = mix(base, dayColor, dayMix); vec3 top = base * 0.72 + vec3(0.03, 0.06, 0.12); vec3 horizon = mix(base, horizonWarm, 0.42); float glow = smoothstep(0.0, 0.34, h) * (1.0 - smoothstep(0.34, 0.72, h)); vec3 col = mix(horizon, top, smoothstep(0.02, 0.95, h)); col += horizonWarm * glow * 0.16; gl_FragColor = vec4(col, 1.0); }'
      })
    );
    scene.add(skyDome);
    disposables.push(skyDome.geometry, skyDome.material);

    const starCount = 500;
    const starsGeom = new THREE.BufferGeometry();
    const starsPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      const r = 95 + Math.random() * 65;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.7;
      starsPos[i * 3] = r * Math.cos(theta) * Math.sin(phi);
      starsPos[i * 3 + 1] = 18 + r * Math.cos(phi);
      starsPos[i * 3 + 2] = r * Math.sin(theta) * Math.sin(phi);
    }
    starsGeom.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
    const stars = new THREE.Points(
      starsGeom,
      new THREE.PointsMaterial({ color: 0xf7f8ff, size: isMobile ? 0.26 : 0.32, transparent: true, opacity: 0.95, depthWrite: false })
    );
    scene.add(stars);
    disposables.push(stars.geometry, stars.material);

    const plane = new THREE.Group();
    const planeBody = new THREE.Group();
    plane.add(planeBody);

    const fuselageMat = new THREE.MeshStandardMaterial({ color: 0xd4c5a0, metalness: 0.05, roughness: 0.85 });
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xc8b89a, metalness: 0.04, roughness: 0.88 });
    const strutMat = new THREE.MeshStandardMaterial({ color: 0x5c4a2a, metalness: 0.08, roughness: 0.9 });
    const engineMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, metalness: 0.7, roughness: 0.45 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x131313, metalness: 0.18, roughness: 0.78 });
    const propellerMat = new THREE.MeshStandardMaterial({ color: 0x8b6914, metalness: 0.12, roughness: 0.7 });
    const wireMat = new THREE.LineBasicMaterial({ color: 0xc8b89a, transparent: true, opacity: 0.65 });
    disposables.push(fuselageMat, wingMat, strutMat, engineMat, tireMat, propellerMat, wireMat);

    const fuselageProfile = [
      new THREE.Vector2(0.01, -2.0),
      new THREE.Vector2(0.18, -1.7),
      new THREE.Vector2(0.24, -0.8),
      new THREE.Vector2(0.28, 0.1),
      new THREE.Vector2(0.24, 0.95),
      new THREE.Vector2(0.15, 1.7),
      new THREE.Vector2(0.03, 2.05)
    ];
    const fuselage = new THREE.Mesh(new THREE.LatheGeometry(fuselageProfile, isMobile ? 18 : 30), fuselageMat);
    fuselage.rotation.z = Math.PI / 2;
    fuselage.castShadow = true;
    fuselage.receiveShadow = true;
    planeBody.add(fuselage);
    disposables.push(fuselage.geometry);

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.21, 0.7, isMobile ? 14 : 20), fuselageMat);
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 2.34;
    nose.castShadow = true;
    planeBody.add(nose);
    disposables.push(nose.geometry);

    const cockpitFrame = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.9, isMobile ? 10 : 16), strutMat);
    cockpitFrame.rotation.z = Math.PI / 2;
    cockpitFrame.position.set(-0.2, 0.15, 0);
    cockpitFrame.castShadow = true;
    planeBody.add(cockpitFrame);
    disposables.push(cockpitFrame.geometry);

    const wingShape = new THREE.Shape();
    wingShape.moveTo(-2, -0.52);
    wingShape.lineTo(2, -0.35);
    wingShape.lineTo(1.7, 0.52);
    wingShape.lineTo(-1.8, 0.38);
    wingShape.lineTo(-2, -0.52);

    const wingGeometry = new THREE.ExtrudeGeometry(wingShape, {
      depth: 0.02,
      bevelEnabled: false,
      curveSegments: isMobile ? 4 : 7
    });
    wingGeometry.translate(0, 0, -0.01);
    wingGeometry.rotateX(-Math.PI / 2);
    const topWing = new THREE.Mesh(wingGeometry, wingMat);
    topWing.position.set(0.18, 0.78, 0.08);
    topWing.castShadow = true;
    topWing.receiveShadow = true;
    planeBody.add(topWing);
    const bottomWing = topWing.clone();
    bottomWing.position.set(-0.08, -0.16, 0.05);
    planeBody.add(bottomWing);
    disposables.push(wingGeometry);

    [-1.15, -0.12, 0.95].forEach((x) => {
      const strutL = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.98, 10), strutMat);
      strutL.position.set(x, 0.34, -0.32);
      strutL.castShadow = true;
      planeBody.add(strutL);

      const strutR = strutL.clone();
      strutR.position.z = 0.3;
      planeBody.add(strutR);
      disposables.push(strutL.geometry);
    });

    const tailH = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.02, 0.72), wingMat);
    tailH.position.set(-1.93, 0.22, 0);
    tailH.castShadow = true;
    tailH.receiveShadow = true;
    planeBody.add(tailH);
    disposables.push(tailH.geometry);

    const tailV = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.58, 0.44), wingMat);
    tailV.position.set(-1.97, 0.5, 0);
    tailV.castShadow = true;
    planeBody.add(tailV);
    disposables.push(tailV.geometry);

    const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.58, isMobile ? 10 : 14), engineMat);
    engine.rotation.z = Math.PI / 2;
    engine.position.set(2.0, 0.03, 0);
    engine.castShadow = true;
    planeBody.add(engine);
    disposables.push(engine.geometry);

    const gearBar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.42, 10), strutMat);
    gearBar.rotation.z = Math.PI / 2;
    gearBar.position.set(0.22, -0.82, 0);
    gearBar.castShadow = true;
    planeBody.add(gearBar);
    disposables.push(gearBar.geometry);

    const wheelGeometry = new THREE.TorusGeometry(0.22, 0.07, isMobile ? 8 : 10, isMobile ? 14 : 22);
    const wheelL = new THREE.Mesh(wheelGeometry, tireMat);
    wheelL.position.set(0.2, -0.9, -0.72);
    wheelL.rotation.y = Math.PI / 2;
    wheelL.castShadow = true;
    wheelL.receiveShadow = true;
    const wheelR = wheelL.clone();
    wheelR.position.z = 0.72;
    planeBody.add(wheelL, wheelR);
    disposables.push(wheelGeometry);

    const rearWheel = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.04, isMobile ? 6 : 8, isMobile ? 12 : 16), tireMat);
    rearWheel.position.set(-1.72, -0.68, 0);
    rearWheel.rotation.y = Math.PI / 2;
    rearWheel.castShadow = true;
    planeBody.add(rearWheel);
    disposables.push(rearWheel.geometry);

    const propellerHub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.22, 12), strutMat);
    propellerHub.rotation.z = Math.PI / 2;
    propellerHub.position.set(2.5, 0.02, 0);
    planeBody.add(propellerHub);
    disposables.push(propellerHub.geometry);

    const propeller = new THREE.Group();
    for (let i = 0; i < 2; i += 1) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.32, 0.13), propellerMat);
      blade.position.y = 0.65;
      blade.rotation.z = i * Math.PI;
      blade.rotation.y = i === 0 ? 0.2 : -0.2;
      blade.castShadow = true;
      propeller.add(blade);
      disposables.push(blade.geometry);
    }
    propeller.rotation.x = Math.PI / 2;
    propeller.position.set(2.61, 0.02, 0);
    planeBody.add(propeller);

    const wirePoints = [];
    [
      [-1.15, 0.72, -0.3, -1.15, -0.14, -0.3],
      [-1.15, 0.72, 0.3, -1.15, -0.14, 0.3],
      [0, 0.72, -0.3, 0, -0.14, -0.3],
      [0, 0.72, 0.3, 0, -0.14, 0.3],
      [0.95, 0.72, -0.3, 0.95, -0.14, -0.3],
      [0.95, 0.72, 0.3, 0.95, -0.14, 0.3],
      [-1.15, 0.72, -0.3, 0, -0.14, 0.3],
      [0, 0.72, -0.3, 0.95, -0.14, 0.3],
      [-1.15, 0.72, 0.3, 0, -0.14, -0.3],
      [0, 0.72, 0.3, 0.95, -0.14, -0.3]
    ].forEach((segment) => {
      wirePoints.push(
        new THREE.Vector3(segment[0], segment[1], segment[2]),
        new THREE.Vector3(segment[3], segment[4], segment[5])
      );
    });
    const wireGeometry = new THREE.BufferGeometry().setFromPoints(wirePoints);
    const wires = new THREE.LineSegments(wireGeometry, wireMat);
    planeBody.add(wires);
    disposables.push(wireGeometry);

    const engineGlow = new THREE.PointLight(0xff6600, 0.5, 3.5, 2);
    engineGlow.position.set(2.05, 0.08, 0);
    planeBody.add(engineGlow);

    plane.scale.setScalar(1.8);
    scene.add(plane);

    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(52, 34),
      new THREE.ShadowMaterial({ opacity: 0.17 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.05;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);
    disposables.push(shadowPlane.geometry, shadowPlane.material);

    function createCloud(x, y, z, scale) {
      const cloud = new THREE.Group();
      const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, transparent: true, opacity: 0.3, depthWrite: false });
      disposables.push(cloudMat);
      const puffs = [
        { x: 0, y: 0, z: 0, s: 1 },
        { x: 0.7, y: 0.25, z: 0, s: 0.82 },
        { x: -0.65, y: 0.15, z: 0.1, s: 0.75 },
        { x: 0.15, y: 0.28, z: 0.5, s: 0.72 },
        { x: 0.2, y: 0.18, z: -0.48, s: 0.67 }
      ];
      puffs.forEach((puff) => {
        const part = new THREE.Mesh(new THREE.SphereGeometry(0.8 * puff.s, isMobile ? 8 : 12, isMobile ? 8 : 12), cloudMat);
        part.position.set(puff.x, puff.y, puff.z);
        cloud.add(part);
        disposables.push(part.geometry);
      });
      cloud.position.set(x, y, z);
      cloud.scale.setScalar(scale);
      scene.add(cloud);
      return cloud;
    }

    const clouds = [
      createCloud(-10, 4.5, -9, 1.6),
      createCloud(8, 3.2, -11, 1.45),
      createCloud(3, 5.6, -16, 1.95),
      ...(!isMobile ? [createCloud(-2, 3.4, -8, 1.12), createCloud(12, 4.1, -15, 1.42)] : [])
    ];

    const trailCount = isMobile ? 42 : 72;
    const trailGeometry = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(trailCount * 3);
    const trailAlpha = new Float32Array(trailCount);
    for (let i = 0; i < trailCount; i += 1) {
      trailPositions[i * 3] = 2;
      trailPositions[i * 3 + 1] = 0.4;
      trailPositions[i * 3 + 2] = 0;
      trailAlpha[i] = 1 - i / trailCount;
    }
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    trailGeometry.setAttribute('alpha', new THREE.BufferAttribute(trailAlpha, 1));
    const trail = new THREE.Points(
      trailGeometry,
      new THREE.ShaderMaterial({
        uniforms: {
          pointSize: { value: isMobile ? 14 : 18 }
        },
        vertexShader: 'attribute float alpha; varying float vAlpha; uniform float pointSize; void main(){ vAlpha = alpha; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_PointSize = pointSize * (300.0 / -mvPosition.z); gl_Position = projectionMatrix * mvPosition; }',
        fragmentShader: 'varying float vAlpha; void main(){ vec2 c = gl_PointCoord - vec2(0.5); float d = dot(c, c); if (d > 0.25) discard; float fade = smoothstep(0.25, 0.0, d); gl_FragColor = vec4(vec3(1.0), vAlpha * fade * 0.55); }',
        transparent: true,
        depthWrite: false
      })
    );
    scene.add(trail);
    disposables.push(trail.geometry, trail.material);

    const trailHistory = Array.from({ length: trailCount }, (_, i) => new THREE.Vector3(2 - i * 0.08, 0, 0));
    const engineOffset = new THREE.Vector3(2.55, 0.08, 0);
    const currentPos = new THREE.Vector3();
    const targetPos = new THREE.Vector3();
    const lookAtPos = new THREE.Vector3();
    const engineWorldPos = new THREE.Vector3();

    function onMouseMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
    }

    function onResize() {
      const width = heroSection.clientWidth || window.innerWidth;
      const height = heroSection.clientHeight || window.innerHeight;
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    function updateGlobalSkyProgress() {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      globalSkyProgress = Math.min(window.scrollY / maxScroll, 1);
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', updateGlobalSkyProgress, { passive: true });
    onResize();
    updateGlobalSkyProgress();

    let heroScrollTrigger;
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      heroScrollTrigger = window.ScrollTrigger.create({
        trigger: '#home',
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => {
          heroScrollProgress = self.progress;
          renderer.domElement.style.opacity = String(Math.max(0, 1 - self.progress * 1.5));
        }
      });
    } else {
      const updateHeroProgress = () => {
        const rect = heroSection.getBoundingClientRect();
        const progress = rect.top < 0 ? Math.min(Math.abs(rect.top) / Math.max(1, rect.height), 1) : 0;
        heroScrollProgress = progress;
        renderer.domElement.style.opacity = String(Math.max(0, 1 - progress * 1.5));
      };
      updateHeroProgress();
      window.addEventListener('scroll', updateHeroProgress, { passive: true });
      window.__tveThreeFallbackProgress = updateHeroProgress;
    }

    const clock = new THREE.Clock();
    function animate() {
      const elapsed = clock.getElapsedTime();
      const pathTime = elapsed * 0.5;

      targetPos.set(
        FLIGHT_CENTER.x + Math.sin(pathTime) * (isMobile ? 3.2 : 4.9),
        FLIGHT_CENTER.y + Math.sin(pathTime * 2) * 0.42 + Math.sin(elapsed * 1.8) * 0.12,
        FLIGHT_CENTER.z + Math.sin(pathTime * 2) * (isMobile ? 1 : 1.55)
      );

      const escapeLift = heroScrollProgress * 8;
      const escapeDepth = heroScrollProgress * -5;
      targetPos.y += escapeLift;
      targetPos.z += escapeDepth;

      plane.position.lerp(targetPos, 0.08);
      currentPos.copy(plane.position);

      lookAtPos.set(
        FLIGHT_CENTER.x + Math.sin(pathTime + 0.08) * (isMobile ? 3.2 : 4.9),
        FLIGHT_CENTER.y + Math.sin((pathTime + 0.08) * 2) * 0.42 + Math.sin((elapsed + 0.08) * 1.8) * 0.12 + escapeLift,
        FLIGHT_CENTER.z + Math.sin((pathTime + 0.08) * 2) * (isMobile ? 1 : 1.55) + escapeDepth
      );
      plane.lookAt(lookAtPos);

      const horizontalTurn = lookAtPos.x - currentPos.x;
      const verticalPitch = lookAtPos.y - currentPos.y;
      const bank = THREE.MathUtils.clamp(horizontalTurn * 0.32, -0.34, 0.34);
      plane.rotateZ(bank);
      plane.rotateX(THREE.MathUtils.clamp(verticalPitch * 0.18, -0.12, 0.12));

      propeller.rotation.x = elapsed * 15;

      clouds.forEach((cloud, index) => {
        cloud.position.x += Math.sin(elapsed * 0.06 + index) * 0.0017;
        cloud.position.y += Math.sin(elapsed * 0.35 + index * 1.8) * 0.0014;
      });

      camera.position.x += ((BASE_CAMERA_POSITION.x + mouse.x * 0.25) - camera.position.x) * 0.03;
      camera.position.y += ((BASE_CAMERA_POSITION.y - mouse.y * 0.16) - camera.position.y) * 0.03;
      camera.lookAt(plane.position.x * 0.3, plane.position.y * 0.55, FLIGHT_CENTER.z);

      skyUniforms.progress.value += (globalSkyProgress - skyUniforms.progress.value) * 0.03;
      stars.material.opacity = Math.max(0, 0.95 - skyUniforms.progress.value * 1.25);

      plane.updateMatrixWorld(true);
      engineWorldPos.copy(engineOffset).applyMatrix4(planeBody.matrixWorld);
      trailHistory.unshift(engineWorldPos.clone());
      trailHistory.pop();
      for (let i = 0; i < trailCount; i += 1) {
        const point = trailHistory[i];
        trailPositions[i * 3] = point.x;
        trailPositions[i * 3 + 1] = point.y + i * 0.004;
        trailPositions[i * 3 + 2] = point.z;
      }
      trail.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      window.__tveThreeFrame = requestAnimationFrame(animate);
    }

    animate();

    window.__tveThreeCleanup = function cleanupThreeScene() {
      if (heroScrollTrigger) heroScrollTrigger.kill();
      if (window.__tveThreeFallbackProgress) {
        window.removeEventListener('scroll', window.__tveThreeFallbackProgress);
        window.__tveThreeFallbackProgress = null;
      }
      if (window.__tveThreeFrame) {
        cancelAnimationFrame(window.__tveThreeFrame);
        window.__tveThreeFrame = null;
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', updateGlobalSkyProgress);
      disposables.forEach((resource) => {
        if (resource && typeof resource.dispose === 'function') {
          resource.dispose();
        }
      });
      renderer.dispose();
    };

    window.addEventListener('pagehide', window.__tveThreeCleanup, { once: true });
  };
})();
