import collection from '../data/projects.json';

// Static data is checked against schema/projects.schema.json before dev/build.
// Replace this adapter when introducing an API; validate remote data at that boundary.
export const projects = collection.projects;
