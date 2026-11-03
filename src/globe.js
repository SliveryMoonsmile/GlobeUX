import {
  AmbientLight, Color, DirectionalLight, MathUtils, PerspectiveCamera,
  Scene, SRGBColorSpace, TextureLoader, Vector3, WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import ThreeGlobe from 'three-globe';
import earthTextureUrl from './assets/earth-night.jpg';

const STATUS_COLORS = { active: '#6dd9fa', inactive: '#ffb86b' };

/** Owns rendering only. Project metadata and UI belong to data.js/main.js. */
export function createGlobe(container, { onError = () => {} } = {}) {
  const renderer = new WebGLRenderer({ antialias: true });
  const scene = new Scene();
  scene.background = new Color('#05090e');
  const camera = new PerspectiveCamera(45, 1, 0.1, 2000);
  camera.position.set(0, 0, 360);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.append(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 160;
  controls.maxDistance = 800;

  // No runtime CDN assets. The grid stays usable if the local texture fails.
  const globe = new ThreeGlobe({ animateIn: false, waitForGlobeReady: false })
    .showGraticules(true)
    .atmosphereColor('#6dd9fa')
    .atmosphereAltitude(0.1)
    .pointLat('lat')
    .pointLng('lng')
    .pointAltitude('importance')
    .pointRadius(0.65)
    .pointColor(project => STATUS_COLORS[project.status])
    .pointsTransitionDuration(0)
    .labelLat('lat')
    .labelLng('lng')
    .labelText('name')
    .labelSize(1.1)
    .labelAltitude(0.015)
    .labelColor(() => '#ffffff')
    .labelDotRadius(0.35)
    .labelsTransitionDuration(0);
  globe.globeMaterial().color.set('#102b3d');
  scene.add(globe, new AmbientLight(0xffffff, 2));
  const light = new DirectionalLight(0xffffff, 2.5);
  light.position.set(1, 1, 2);
  scene.add(light);

  let destroyed = false;
  const texture = new TextureLoader().load(earthTextureUrl, loaded => {
    if (destroyed) { loaded.dispose(); return; }
    loaded.colorSpace = SRGBColorSpace;
    const material = globe.globeMaterial();
    material.map = loaded;
    material.color.set('#ffffff');
    material.needsUpdate = true;
  }, undefined, () => {
    if (!destroyed) onError('The basemap could not load. Projects are shown on the latitude/longitude grid.');
  });

  function resize() {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    const halfFov = Math.atan(Math.tan(MathUtils.degToRad(camera.fov / 2)) * Math.min(camera.aspect, 1));
    const fitDistance = globe.getGlobeRadius() * 1.4 / Math.sin(halfFov);
    camera.position.setLength(Math.max(camera.position.length(), fitDistance));
    controls.maxDistance = Math.max(800, fitDistance * 1.5);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  let contextLost = false;
  function syncAnimation() {
    const paused = document.hidden || contextLost;
    if (paused) globe.pauseAnimation();
    else globe.resumeAnimation();
    renderer.setAnimationLoop(paused ? null : () => {
      controls.update();
      globe.setPointOfView(camera);
      renderer.render(scene, camera);
    });
  }
  function handleContextLost(event) {
    event.preventDefault();
    contextLost = true;
    syncAnimation();
    onError('The graphics context was lost. Reload to restore the globe; the project list remains available.');
  }
  renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
  document.addEventListener('visibilitychange', syncAnimation);
  syncAnimation();

  return {
    setProjects(projects) {
      globe.pointsData(projects);
    },
    focusProject(project) {
      const { x, y, z } = globe.getCoords(project.lat, project.lng);
      camera.position.copy(new Vector3(x, y, z).normalize().multiplyScalar(camera.position.length()));
      controls.target.set(0, 0, 0);
      controls.update();
      globe.labelsData([project]);
    },
    destroy() {
      destroyed = true;
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', syncAnimation);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.setAnimationLoop(null);
      controls.dispose();
      globe._destructor();
      texture.dispose();
      const geometries = new Set();
      const materials = new Set();
      scene.traverse(object => {
        if (object.geometry) geometries.add(object.geometry);
        if (object.material) {
          for (const material of [object.material].flat()) materials.add(material);
        }
      });
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      scene.clear();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
