import { projects } from './data.js';
import './styles.css';

const status = document.querySelector('#status');
let view;
let selected;

function selectProject(project) {
  selected = project;
  document.querySelector('#details').hidden = false;
  document.querySelector('#project-name').textContent = project.name;
  document.querySelector('#project-description').textContent = project.description;
  document.querySelector('#project-location').textContent =
    `${project.lat.toFixed(4)}°, ${project.lng.toFixed(4)}° · ${project.status}`;
  for (const button of document.querySelectorAll('#projects button')) {
    button.setAttribute('aria-pressed', String(button.dataset.id === project.id));
  }
  view?.focusProject(project);
}

// Keep the list usable when WebGL or the renderer module cannot load.
const list = document.querySelector('#projects');
for (const project of projects) {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.id = project.id;
  button.dataset.status = project.status;
  button.setAttribute('aria-pressed', 'false');
  button.textContent = `${project.name} · ${project.status}`;
  button.addEventListener('click', () => selectProject(project));
  item.append(button);
  list.append(item);
}

try {
  const { createGlobe } = await import('./globe.js');
  view = createGlobe(document.querySelector('#globe'), {
    onError(message) { status.textContent = message; },
  });
  view.setProjects(projects);
  if (selected || projects[0]) selectProject(selected || projects[0]);
  status.textContent = `${projects.length} sample projects loaded.`;
} catch (error) {
  console.error('Globe initialization failed:', error);
  status.textContent = 'The 3D view is unavailable. Try a browser with WebGL2 enabled. You can still explore the project list.';
}

if (import.meta.hot) import.meta.hot.dispose(() => view?.destroy());
