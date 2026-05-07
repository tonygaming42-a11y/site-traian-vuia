(function () {
  window.initThreeScene = function initThreeScene() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas || !window.THREE) {
      console.warn('Three.js scene was not initialized because canvas or THREE is unavailable.');
      return;
    }

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const mouse = { x: 0, y: 0 };

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x071126, isMobile ? 0.035 : 0.023);

    const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 350);
    camera.position.set(0, 2, isMobile ? 12 : 10);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.6 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    const hemi = new THREE.HemisphereLight(0x9fd6ff, 0x0d1728, 0.95);
    const key = new THREE.DirectionalLight(0xffd27e, 1.35);
    key.position.set(8, 12, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -14;
    key.shadow.camera.right = 14;
    key.shadow.camera.top = 14;
    key.shadow.camera.bottom = -14;
    scene.add(ambient, hemi, key);

    const skyUniforms = {
      nightTop: { value: new THREE.Color(0x050816) },
      nightBottom: { value: new THREE.Color(0x0f2444) },
      dayTop: { value: new THREE.Color(0x87ceeb) },
      dayBottom: { value: new THREE.Color(0x4da3ff) },
      mixAmount: { value: 0 }
    };

    const skyDome = new THREE.Mesh(
      new THREE.SphereGeometry(180, 48, 24),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms: skyUniforms,
        vertexShader: 'varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader:
          'uniform vec3 nightTop; uniform vec3 nightBottom; uniform vec3 dayTop; uniform vec3 dayBottom; uniform float mixAmount; varying vec3 vPos; void main(){ float h = smoothstep(-1.0, 1.0, normalize(vPos).y); vec3 night = mix(nightBottom, nightTop, h); vec3 day = mix(dayBottom, dayTop, h); gl_FragColor = vec4(mix(night, day, mixAmount), 1.0); }'
      })
    );
    scene.add(skyDome);

    const starCount = isMobile ? 120 : 260;
    const starsGeom = new THREE.BufferGeometry();
    const starsPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      const r = 120 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.65;
      starsPos[i * 3] = r * Math.cos(theta) * Math.sin(phi);
      starsPos[i * 3 + 1] = 40 + r * Math.cos(phi);
      starsPos[i * 3 + 2] = r * Math.sin(theta) * Math.sin(phi);
    }
    starsGeom.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
    const stars = new THREE.Points(
      starsGeom,
      new THREE.PointsMaterial({ color: 0xfff6c2, size: isMobile ? 0.45 : 0.55, transparent: true, opacity: 0.9 })
    );
    scene.add(stars);

    const plane = new THREE.Group();
    const fuselageMat = new THREE.MeshStandardMaterial({ color: 0xf5e9cf, roughness: 0.32, metalness: 0.25 });
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x1f57c6, roughness: 0.42, metalness: 0.15 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xf4a300, roughness: 0.2, metalness: 0.55, emissive: 0x2f1a00, emissiveIntensity: 0.18 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x181d2a, roughness: 0.56, metalness: 0.2 });

    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.22, 4.3, 24), fuselageMat);
    fuselage.rotation.z = Math.PI / 2;
    fuselage.castShadow = true;
    plane.add(fuselage);

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.62, 24), accentMat);
    nose.rotation.z = -Math.PI / 2;
    nose.position.x = 2.44;
    nose.castShadow = true;
    plane.add(nose);

    const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.24, 18, 18), new THREE.MeshStandardMaterial({ color: 0x9ed0ff, transparent: true, opacity: 0.65, roughness: 0.12, metalness: 0.2 }));
    cockpit.scale.set(1.3, 0.8, 0.9);
    cockpit.position.set(-0.1, 0.25, 0);
    cockpit.castShadow = true;
    plane.add(cockpit);

    const topWing = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 0.9), wingMat);
    topWing.position.y = 0.65;
    topWing.castShadow = true;
    plane.add(topWing);

    const bottomWing = topWing.clone();
    bottomWing.position.y = -0.48;
    plane.add(bottomWing);

    [-1.15, 0, 1.15].forEach((x) => {
      const strutL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.05, 10), accentMat);
      strutL.position.set(x, 0.08, -0.3);
      strutL.castShadow = true;
      plane.add(strutL);

      const strutR = strutL.clone();
      strutR.position.z = 0.3;
      plane.add(strutR);
    });

    const tailH = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.08, 0.75), wingMat);
    tailH.position.set(-2.05, 0.28, 0);
    tailH.castShadow = true;
    plane.add(tailH);

    const tailV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.58, 0.52), accentMat);
    tailV.position.set(-2.02, 0.56, 0);
    tailV.castShadow = true;
    plane.add(tailV);

    const gearBar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.45, 10), darkMat);
    gearBar.rotation.z = Math.PI / 2;
    gearBar.position.set(0.3, -0.9, 0);
    gearBar.castShadow = true;
    plane.add(gearBar);

    const wheelGeometry = new THREE.TorusGeometry(0.24, 0.09, 12, 24);
    const wheelL = new THREE.Mesh(wheelGeometry, darkMat);
    wheelL.position.set(0.3, -1.02, -0.78);
    wheelL.rotation.y = Math.PI / 2;
    wheelL.castShadow = true;
    const wheelR = wheelL.clone();
    wheelR.position.z = 0.78;
    plane.add(wheelL, wheelR);

    const rearWheel = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.045, 10, 20), darkMat);
    rearWheel.position.set(-1.88, -0.75, 0);
    rearWheel.rotation.y = Math.PI / 2;
    rearWheel.castShadow = true;
    plane.add(rearWheel);

    const propellerHub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.18, 12), accentMat);
    propellerHub.rotation.z = Math.PI / 2;
    propellerHub.position.set(2.57, 0, 0);
    plane.add(propellerHub);

    const propeller = new THREE.Group();
    for (let i = 0; i < 3; i += 1) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.1, 0.14), darkMat);
      blade.position.y = 0.55;
      blade.rotation.z = (Math.PI * 2 * i) / 3;
      blade.castShadow = true;
      propeller.add(blade);
    }
    propeller.rotation.x = Math.PI / 2;
    propeller.position.set(2.64, 0, 0);
    plane.add(propeller);

    plane.scale.setScalar(isMobile ? 0.82 : 1.18);
    scene.add(plane);

    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(32, 22),
      new THREE.ShadowMaterial({ opacity: 0.14 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.1;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    function createCloud(x, y, z, scale) {
      const cloud = new THREE.Group();
      const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, transparent: true, opacity: 0.88 });
      const puffs = [
        { x: 0, y: 0, z: 0, s: 1 },
        { x: 0.7, y: 0.25, z: 0, s: 0.82 },
        { x: -0.65, y: 0.15, z: 0.1, s: 0.75 },
        { x: 0.15, y: 0.28, z: 0.5, s: 0.72 },
        { x: 0.2, y: 0.18, z: -0.48, s: 0.67 }
      ];
      puffs.forEach((puff) => {
        const part = new THREE.Mesh(new THREE.SphereGeometry(0.8 * puff.s, 16, 16), cloudMat);
        part.position.set(puff.x, puff.y, puff.z);
        cloud.add(part);
      });
      cloud.position.set(x, y, z);
      cloud.scale.setScalar(scale);
      scene.add(cloud);
      return cloud;
    }

    const clouds = [
      createCloud(-8, 4.8, -8, 1.5),
      createCloud(8, 3.7, -10, 1.35),
      createCloud(2, 5.1, -14, 1.85),
      ...(!isMobile ? [createCloud(-3, 3.2, -7, 1.1), createCloud(11, 4.5, -16, 1.4)] : [])
    ];

    const trailCount = isMobile ? 70 : 140;
    const trailGeometry = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(trailCount * 3);
    const trailSizes = new Float32Array(trailCount);
    for (let i = 0; i < trailCount; i += 1) {
      trailPositions[i * 3] = 0;
      trailPositions[i * 3 + 1] = 0;
      trailPositions[i * 3 + 2] = 0;
      trailSizes[i] = Math.random() * 0.35 + 0.2;
    }
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    trailGeometry.setAttribute('size', new THREE.BufferAttribute(trailSizes, 1));
    const trail = new THREE.Points(
      trailGeometry,
      new THREE.PointsMaterial({ color: 0xfbc04d, size: isMobile ? 0.17 : 0.2, transparent: true, opacity: 0.78, depthWrite: false })
    );
    scene.add(trail);

    const trailHistory = Array.from({ length: trailCount }, () => new THREE.Vector3(0, 0, 0));

    function onMouseMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (event.clientY / window.innerHeight) * 2 - 1;
    }

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    const baseCamera = new THREE.Vector3(0, 2, isMobile ? 12 : 10);

    function animate() {
      const t = clock.getElapsedTime();
      const scrollProgress = Math.min(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight), 1);

      const x = Math.sin(t * 0.42) * (isMobile ? 2.4 : 3.8);
      const y = 1.2 + Math.sin(t * 0.84) * (isMobile ? 0.36 : 0.65);
      const z = -1.4 + Math.cos(t * 0.42) * (isMobile ? 1.1 : 1.8);
      plane.position.set(x, y, z);

      const dx = Math.cos(t * 0.42) * 0.42;
      const dy = Math.cos(t * 0.84) * 0.84;
      const dz = -Math.sin(t * 0.42) * 0.42;
      const targetDir = new THREE.Vector3(dx, dy, dz).normalize();
      plane.lookAt(plane.position.clone().add(targetDir));
      plane.rotation.z += Math.sin(t * 1.8) * 0.045;

      propeller.rotation.z += isMobile ? 1.2 : 1.7;

      clouds.forEach((cloud, index) => {
        cloud.position.x += Math.sin(t * 0.05 + index) * 0.0024;
        cloud.position.y += Math.sin(t * 0.5 + index * 1.8) * 0.0036;
      });

      camera.position.x += ((baseCamera.x + mouse.x * 0.42) - camera.position.x) * 0.03;
      camera.position.y += ((baseCamera.y - mouse.y * 0.26) - camera.position.y) * 0.03;
      camera.lookAt(0, 0.7, -2);

      skyUniforms.mixAmount.value += (scrollProgress - skyUniforms.mixAmount.value) * 0.03;
      stars.material.opacity = 0.88 * (1 - skyUniforms.mixAmount.value * 1.3);
      key.intensity = 1.1 + skyUniforms.mixAmount.value * 0.7;

      trailHistory.unshift(plane.position.clone().add(new THREE.Vector3(-0.85, 0.05, 0)));
      trailHistory.pop();
      for (let i = 0; i < trailCount; i += 1) {
        const point = trailHistory[i];
        trailPositions[i * 3] = point.x + (Math.random() - 0.5) * 0.08;
        trailPositions[i * 3 + 1] = point.y + (Math.random() - 0.5) * 0.08;
        trailPositions[i * 3 + 2] = point.z + (Math.random() - 0.5) * 0.08;
      }
      trail.geometry.attributes.position.needsUpdate = true;
      trail.material.opacity = 0.55 + Math.sin(t * 5) * 0.2;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();
  };
})();
