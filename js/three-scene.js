(function () {
  window.initThreeScene = function initThreeScene() {
    if (window.__threeSceneInitialized) return true;

    const canvas = document.getElementById('three-canvas');
    const hero = document.getElementById('home');

    if (!canvas || !hero || !window.THREE) {
      console.warn('Three.js scene was not initialized because required elements are unavailable.');
      return false;
    }

    window.__threeSceneInitialized = true;
    console.log('Initializing hero Three.js scene');

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const mouseTarget = { x: 0, y: 0 };
    const scrollState = { progress: 0 };
    const TOP_WING = { span: 3.8, thickness: 0.025, chord: 0.72, y: 0.35, dihedral: 0.02 };
    const BOTTOM_WING = { span: 3.2, thickness: 0.025, chord: 0.64, y: -0.22, dihedral: 0.018 };
    const STRUT_X_POSITIONS = [-1.25, -0.4, 0.4, 1.25];
    const STRUT_Z_POSITIONS = [-0.27, 0.27];
    const cameraBase = { x: 0, y: 1, z: 7 };

    function getHeroSize() {
      return {
        width: hero.clientWidth || window.innerWidth,
        height: hero.clientHeight || window.innerHeight
      };
    }

    const scene = new THREE.Scene();

    const heroSize = getHeroSize();
    const camera = new THREE.PerspectiveCamera(48, heroSize.width / heroSize.height, 0.1, 240);
    camera.position.set(cameraBase.x, cameraBase.y, cameraBase.z);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(heroSize.width, heroSize.height, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvas.style.setProperty('--three-canvas-opacity', '1');

    const sunLight = new THREE.DirectionalLight(0xFFF4E0, 2.5);
    sunLight.position.set(5, 8, 3);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.camera.left = -8;
    sunLight.shadow.camera.right = 8;
    sunLight.shadow.camera.top = 8;
    sunLight.shadow.camera.bottom = -8;

    const fillLight = new THREE.DirectionalLight(0xC8D8F0, 0.6);
    fillLight.position.set(-3, 2, -2);

    const rimLight = new THREE.DirectionalLight(0xF0E8D0, 0.4);
    rimLight.position.set(0, -1, -5);

    const ambientLight = new THREE.AmbientLight(0x101820, 0.8);
    scene.add(sunLight, fillLight, rimLight, ambientLight);

    const skyUniforms = {
      topNight: { value: new THREE.Color(0x05080F) },
      bottomNight: { value: new THREE.Color(0x0D1428) },
      topDay: { value: new THREE.Color(0x0A1E3D) },
      bottomDay: { value: new THREE.Color(0x1A3060) },
      mixAmount: { value: 0 }
    };

    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(80, 32, 32),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: skyUniforms,
        vertexShader: 'varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: 'uniform vec3 topNight; uniform vec3 bottomNight; uniform vec3 topDay; uniform vec3 bottomDay; uniform float mixAmount; varying vec3 vPos; void main(){ float h = smoothstep(-1.0, 1.0, normalize(vPos).y); vec3 night = mix(bottomNight, topNight, h); vec3 day = mix(bottomDay, topDay, h); gl_FragColor = vec4(mix(night, day, mixAmount), 1.0); }'
      })
    );
    scene.add(sky);

    const starCount = isMobile ? 2000 : 2600;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      starPositions[i * 3] = (Math.random() - 0.5) * 200;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.4,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
        depthWrite: false
      })
    );
    scene.add(stars);

    const brightStarCount = isMobile ? 200 : 260;
    const brightStarGeometry = new THREE.BufferGeometry();
    const brightPositions = new Float32Array(brightStarCount * 3);
    for (let i = 0; i < brightStarCount; i += 1) {
      brightPositions[i * 3] = (Math.random() - 0.5) * 150;
      brightPositions[i * 3 + 1] = Math.random() * 100;
      brightPositions[i * 3 + 2] = (Math.random() - 0.5) * 150;
    }
    brightStarGeometry.setAttribute('position', new THREE.BufferAttribute(brightPositions, 3));
    const brightStars = new THREE.Points(
      brightStarGeometry,
      new THREE.PointsMaterial({
        color: 0xFFEECC,
        size: 0.8,
        transparent: true,
        opacity: 1,
        sizeAttenuation: true,
        depthWrite: false
      })
    );
    scene.add(brightStars);

    function createCloud(x, y, z, scale) {
      const cloud = new THREE.Group();
      const cloudMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.06,
        roughness: 1,
        metalness: 0
      });

      [
        [0, 0, 0, 1],
        [0.45, 0.08, 0.15, 0.75],
        [-0.48, 0.03, -0.1, 0.68],
        [0.1, 0.14, -0.35, 0.62]
      ].forEach(([cx, cy, cz, s]) => {
        const part = new THREE.Mesh(new THREE.SphereGeometry(0.7 * s, 12, 12), cloudMaterial);
        part.position.set(cx, cy, cz);
        cloud.add(part);
      });

      cloud.position.set(x, y, z);
      cloud.scale.setScalar(scale);
      scene.add(cloud);
      return cloud;
    }

    const clouds = [
      createCloud(-6, 2.8, -8, 1.6),
      createCloud(5, 3.3, -10, 1.4),
      createCloud(1.5, 2.4, -7, 1.1)
    ];

    const plane = new THREE.Group();

    const fuselageGeo = new THREE.CylinderGeometry(0.04, 0.14, 2.2, 12);
    const fuselageMat = new THREE.MeshStandardMaterial({ color: 0xC8B89A, metalness: 0.0, roughness: 0.88 });
    const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
    fuselage.rotation.z = Math.PI / 2;
    fuselage.castShadow = true;
    plane.add(fuselage);

    const noseCap = new THREE.Mesh(
      new THREE.ConeGeometry(0.11, 0.22, 12),
      new THREE.MeshStandardMaterial({ color: 0xB9A98C, metalness: 0.0, roughness: 0.82 })
    );
    noseCap.rotation.z = -Math.PI / 2;
    noseCap.position.x = 1.2;
    noseCap.castShadow = true;
    plane.add(noseCap);

    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xD4C9A8,
      metalness: 0.0,
      roughness: 0.95,
      side: THREE.DoubleSide
    });

    const topWing = new THREE.Mesh(new THREE.BoxGeometry(TOP_WING.span, TOP_WING.thickness, TOP_WING.chord), wingMat);
    topWing.position.set(0, TOP_WING.y, 0);
    topWing.rotation.z = TOP_WING.dihedral;
    topWing.castShadow = true;
    plane.add(topWing);

    const bottomWing = new THREE.Mesh(new THREE.BoxGeometry(BOTTOM_WING.span, BOTTOM_WING.thickness, BOTTOM_WING.chord), wingMat);
    bottomWing.position.set(0, BOTTOM_WING.y, 0);
    bottomWing.rotation.z = BOTTOM_WING.dihedral;
    bottomWing.castShadow = true;
    plane.add(bottomWing);

    const strutMat = new THREE.MeshStandardMaterial({ color: 0x5C3D1E, metalness: 0.0, roughness: 0.9 });
    STRUT_X_POSITIONS.forEach((x) => {
      STRUT_Z_POSITIONS.forEach((z) => {
        const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 8), strutMat);
        strut.position.set(x, 0.07, z);
        strut.castShadow = true;
        plane.add(strut);
      });
    });

    const engineMat = new THREE.MeshStandardMaterial({ color: 0x2A2A2A, metalness: 0.8, roughness: 0.4 });
    const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.18, 16), engineMat);
    engine.rotation.z = Math.PI / 2;
    engine.position.x = 1.05;
    engine.castShadow = true;
    plane.add(engine);

    for (let i = 0; i < 3; i += 1) {
      const fin = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.006, 6, 20), new THREE.MeshStandardMaterial({ color: 0x3A3A3A, metalness: 0.72, roughness: 0.45 }));
      fin.position.x = 0.98 + i * 0.045;
      fin.rotation.y = Math.PI / 2;
      plane.add(fin);
    }

    const propeller = new THREE.Group();
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x8B5E2A, metalness: 0.0, roughness: 0.8 });

    const bladeA = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.02), bladeMat);
    bladeA.position.y = 0.35;
    bladeA.rotation.z = Math.PI / 12;
    propeller.add(bladeA);

    const bladeB = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.02), bladeMat);
    bladeB.position.y = -0.35;
    bladeB.rotation.z = Math.PI + Math.PI / 12;
    propeller.add(bladeB);

    const propHub = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.09, 10), new THREE.MeshStandardMaterial({ color: 0x4B3A2A, roughness: 0.72, metalness: 0.15 }));
    propHub.rotation.z = Math.PI / 2;
    propeller.add(propHub);
    propeller.position.x = 1.19;
    propeller.rotation.x = Math.PI / 2;
    plane.add(propeller);

    const tailH = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.02, 0.28), wingMat);
    tailH.position.set(-1.03, 0.02, 0);
    tailH.castShadow = true;
    plane.add(tailH);

    const tailV = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.32, 0.28), wingMat);
    tailV.position.set(-1.03, 0.17, 0);
    tailV.castShadow = true;
    plane.add(tailV);

    const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.7, 8), strutMat);
    axle.rotation.z = Math.PI / 2;
    axle.position.set(0.2, -0.52, 0);
    plane.add(axle);

    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1A1A1A, metalness: 0.05, roughness: 0.95 });
    const leftWheel = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.04, 8, 16), wheelMat);
    leftWheel.position.set(0.2, -0.52, -0.35);
    leftWheel.rotation.y = Math.PI / 2;
    leftWheel.castShadow = true;

    const rightWheel = leftWheel.clone();
    rightWheel.position.z = 0.35;
    plane.add(leftWheel, rightWheel);

    [-0.16, 0.16].forEach((z) => {
      const gearStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.35, 8), strutMat);
      gearStrut.position.set(0.05, -0.36, z);
      gearStrut.rotation.z = z > 0 ? -0.36 : 0.36;
      plane.add(gearStrut);
    });

    const wirePoints = [];
    STRUT_X_POSITIONS.forEach((x) => {
      STRUT_Z_POSITIONS.forEach((z) => {
        wirePoints.push([x, TOP_WING.y, z], [x, BOTTOM_WING.y, z]);
      });
    });

    const wireGeometry = new THREE.BufferGeometry();
    wireGeometry.setAttribute('position', new THREE.Float32BufferAttribute(wirePoints.flat(), 3));
    const wires = new THREE.LineSegments(wireGeometry, new THREE.LineBasicMaterial({ color: 0x8A7A6A, transparent: true, opacity: 0.7 }));
    plane.add(wires);

    plane.scale.setScalar(isMobile ? 1.8 : 2);
    plane.position.set(0, 0, 0);
    scene.add(plane);

    const groundShadow = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), new THREE.ShadowMaterial({ opacity: 0.14 }));
    groundShadow.rotation.x = -Math.PI / 2;
    groundShadow.position.y = -1.4;
    groundShadow.receiveShadow = true;
    scene.add(groundShadow);

    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      window.ScrollTrigger.create({
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          scrollState.progress = self.progress;
        }
      });
    } else {
      const updateScrollFallback = () => {
        const heroRect = hero.getBoundingClientRect();
        const range = hero.offsetHeight || window.innerHeight;
        const progressed = Math.min(Math.max(-heroRect.top / range, 0), 1);
        scrollState.progress = progressed;
      };
      window.addEventListener('scroll', updateScrollFallback, { passive: true });
      updateScrollFallback();
    }

    function onMouseMove(event) {
      mouseTarget.x = (event.clientX / window.innerWidth - 0.5) * 0.3;
      mouseTarget.y = (event.clientY / window.innerHeight - 0.5) * 0.2;
    }

    function onResize() {
      const nextSize = getHeroSize();
      camera.aspect = nextSize.width / nextSize.height;
      camera.updateProjectionMatrix();
      renderer.setSize(nextSize.width, nextSize.height, false);
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();

    function animate() {
      const elapsed = clock.getElapsedTime();
      const delta = clock.getDelta();
      const t = elapsed * 0.18;

      plane.position.x = Math.sin(t) * 2.8;
      plane.position.y = Math.sin(t * 2) * 0.35;
      plane.position.z = Math.cos(t * 0.9) * 0.6;

      plane.rotation.z = -Math.cos(t) * 0.18;
      plane.rotation.x = Math.cos(t * 2) * 0.06;
      plane.position.y += Math.sin(elapsed * 3.7) * 0.015;

      const climb = scrollState.progress;
      plane.position.y += climb * 2.7;
      plane.position.z -= climb * 1.8;
      plane.rotation.x -= climb * 0.18;

      propeller.rotation.x += delta * 12;

      camera.position.x += ((cameraBase.x + mouseTarget.x) - camera.position.x) * 0.02;
      camera.position.y += ((cameraBase.y - mouseTarget.y) - camera.position.y) * 0.02;
      camera.position.z += (cameraBase.z - camera.position.z) * 0.02;
      camera.lookAt(0, 0, 0);

      const heroHeight = hero.offsetHeight || window.innerHeight;
      const fadeStart = heroHeight * 0.5;
      const fadeProgress = Math.min(Math.max((window.scrollY - fadeStart) / Math.max(heroHeight - fadeStart, 1), 0), 1);
      const pageProgress = Math.min(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight), 1);
      skyUniforms.mixAmount.value += (pageProgress - skyUniforms.mixAmount.value) * 0.02;
      canvas.style.setProperty('--three-canvas-opacity', String(1 - fadeProgress));
      stars.material.opacity = Math.max(0.25, 0.9 - fadeProgress * 0.75);
      brightStars.material.opacity = Math.max(0.2, 1 - fadeProgress * 0.8);
      stars.rotation.y += 0.00005;
      brightStars.rotation.y += 0.00003;

      clouds.forEach((cloud, index) => {
        cloud.position.x += 0.0014 + index * 0.0002;
        if (cloud.position.x > 10) cloud.position.x = -10;
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();
    return true;
  };
})();
