# Prototype modernization notes

The original GlobeUX issue was a single CDN-backed Three.js prototype. This branch keeps the three demonstration projects while making it maintainable:

- npm ESM dependencies are pinned in package-lock.json; Vite builds a static dist/ bundle with relative asset paths.
- Project records live in data/projects.json, are governed by schema/projects.schema.json, and are validated by scripts/project-data.mjs in tests and builds.
- Rendering is isolated in src/globe.js; list, selection, status messages, and the data adapter stay outside the renderer.
- The night-Earth basemap is bundled locally with provenance and an upstream license; a graticule remains if the texture fails.
- CI runs npm ci and npm run check. Pages deployment is manual and opt-in; this branch does not publish or change settings.

## Scientific visualization boundary

importance is only a dimensionless display weight. It is not an observation, elevation, confidence score, or research quality measure. Future measurements should use a separate observation schema with stable IDs, source/provenance, variable, value, unit, timestamp, uncertainty, and quality flags. Add explicit scales, legends, missing-data behavior, coordinate reference semantics, and attribution before introducing heatmaps, animation, aggregation, or claims about density or risk.

## Deployment check

Run npm ci and npm run check, then host the contents of dist/ over HTTPS. Test the root and any subdirectory URL, all project selections, orbit/zoom, resize, and a no-WebGL2 fallback on target devices. No runtime CDN, API key, backend, or Node server is required.
