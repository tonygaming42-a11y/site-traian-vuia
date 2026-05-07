(function () {
  window.initThreeScene = function initThreeScene() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas || !window.THREE) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 6);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xf4a300, 1.2);
    directional.position.set(4, 4, 2);
    scene.add(directional);

    const fuselage = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.18, 1.4, 6, 12),
      new THREE.MeshStandardMaterial({ color: 0xd9d9d9, metalness: 0.4, roughness: 0.45 })
    );

    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.06, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x002b7f, metalness: 0.2, roughness: 0.45 })
    );

    const tail = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.25, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xf4a300 })
    );
    tail.position.set(-0.9, 0.28, 0);

    const plane = new THREE.Group();
    wing.position.set(0, 0, 0);
    fuselage.rotation.z = Math.PI / 2;
    plane.add(fuselage, wing, tail);
    scene.add(plane);

    const trailGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-4.8, 0.2, 0),
      new THREE.Vector3(-1.4, 0, 0)
    ]);
    const trail = new THREE.Line(trailGeometry, new THREE.LineBasicMaterial({ color: 0xf4a300, transparent: true, opacity: 0.7 }));
    scene.add(trail);

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    function animate() {
      const elapsed = clock.getElapsedTime();
      plane.position.x = Math.sin(elapsed * 0.35) * 1.7;
      plane.position.y = Math.sin(elapsed * 0.6) * 0.28;
      plane.rotation.z = Math.sin(elapsed * 0.7) * 0.12;
      wing.scale.y = 1 + Math.sin(elapsed * 2.4) * 0.06;
      trail.material.opacity = 0.45 + Math.sin(elapsed * 3) * 0.2;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();
  };
})();
