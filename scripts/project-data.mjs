import Ajv from 'ajv';
import schema from '../schema/projects.schema.json' with { type: 'json' };

const validateSchema = new Ajv({ allErrors: true, strict: true }).compile(schema);

export function validateProjectData(data) {
  if (!validateSchema(data)) {
    throw new Error(`Invalid project data: ${JSON.stringify(validateSchema.errors)}`);
  }
  const ids = new Set();
  for (const project of data.projects) {
    if (ids.has(project.id)) throw new Error(`Duplicate project id: ${project.id}`);
    ids.add(project.id);
  }
  return data;
}
