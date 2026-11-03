import data from '../data/projects.json' with { type: 'json' };
import { validateProjectData } from './project-data.mjs';

validateProjectData(data);
console.log(`Validated ${data.projects.length} demo projects (schema v${data.schemaVersion}).`);
