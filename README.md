# GlobeUX

A small citizen-science globe starter using Three.js, three-globe, OrbitControls, and Vite. The original three sample projects are retained as **demonstration data**, not verified research locations.

## Run locally

Use Node 24 (`nvm use` if nvm is installed), then:

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Choose a project in the keyboard-accessible list to center the globe and show its details. Drag to orbit, scroll/pinch to zoom. Project details remain available if WebGL2 is unavailable. The original night-Earth texture is bundled locally with a 10° graticule fallback; it makes no external image, font, script, or data requests. Asset provenance is in `src/assets/`; the upstream license is copied from `public/third-party/` to the deployment output.

```sh
npm run check     # schema/ID tests, validate data, production build
npm run preview   # inspect dist/ locally after building
```

Do not open index.html with `file://`, deploy the source folder, or use the Vite development/preview server as a production server. Production needs only static hosting for `dist/`.

## Structure

| File | Responsibility |
| --- | --- |
| `index.html`, `src/styles.css` | Accessible page structure and responsive layout |
| `data/projects.json` | Versioned project collection; no renderer code |
| `schema/projects.schema.json` | JSON Schema draft-07 data contract |
| `scripts/project-data.mjs` | Schema validation and unique-ID check, shared by tests/build tooling |
| `src/data.js` | Static data adapter; future API boundary |
| `src/main.js` | List, selection, safe text rendering, status/error messages |
| `src/globe.js` | Scene, controls, points, selected label, resizing, lifecycle |
| `vite.config.js`, `package-lock.json` | Static deployment paths and reproducible dependency graph |

Keep the JSON Schema as the contract. `npm run dev` and `npm run build` validate the bundled data before starting; CI does the same. Restart dev after editing data to rerun validation. Validation currently runs at build time because the dataset is bundled; a future API adapter must validate each fetched response before updating the renderer.

## Minimal project schema

```json
{
  "schemaVersion": 1,
  "dataKind": "demo",
  "projects": [{
    "id": "unique-project-slug",
    "name": "Project name",
    "description": "What the project studies",
    "lat": 37.7749,
    "lng": -122.4194,
    "importance": 0.25,
    "status": "active"
  }]
}
```

IDs must be unique, lowercase slugs. Coordinates use WGS84 decimal degrees: latitude −90…90, longitude −180…180, north/east positive. Status is `active` or `inactive`. `importance` is a dimensionless **display weight** from 0 to 1, used as altitude in globe-radius units. It is not elevation, a measured variable, research quality, or confidence. Color is derived from status in the renderer. Unknown fields and unsupported schema versions fail validation; empty collections are valid. Schema v1 intentionally admits demo collections only; add provenance before supporting real records.

## Deploy

1. Run `npm ci` and `npm run check`.
2. Upload the **contents** of `dist/` to a static HTTPS host, preserving `assets/`. No Node server or API credentials are required.
3. Test the hosted URL: load all three projects, select each, orbit/zoom, resize, and confirm the console/network panel has no failed assets or module errors.

`base: './'` makes built assets resolve at `/`, `/GlobeUX/`, or another subdirectory. This is a single page with no client-side routes; use a trailing slash for directory URLs. Keep index.html revalidated and hashed assets cacheable; deploy them together and retain old hashed assets during cache turnover. The lazy globe module is about 524 KB gzip with the current dependencies; Vite's size warning is expected. Avoid adding a framework or splitting library internals just to hide it.

**GitHub Pages:** after merging, choose **Settings → Pages → Source: GitHub Actions**, then run **Deploy to GitHub Pages** on `main` from the Actions tab. The included workflow builds and checks before publishing; it does not publish on push. The separate Check starter workflow validates branches and PRs.

**S3/CloudFront:** the same `dist/` output works on an existing static distribution. Use a private S3 origin with CloudFront access, an index.html default root object, and HTTPS. No application changes or database are necessary. Hosting infrastructure is intentionally outside this starter.

## Design choices and next steps

- Exact npm versions and the lockfile replace mixed CDN imports. `three/addons/…` uses the same Three.js instance as three-globe; Vite also deduplicates `three`.
- Only supported three-globe methods are used. Background belongs to the Three.js scene. A selected globe label and accessible list replace the invalid wrapper tooltip call. Marker hover/click picking is not implemented; use list selection.
- The baseline avoids remote texture availability, CORS, and unpinned asset changes. A local TextureLoader applies the night-Earth map and reports failures while retaining the grid fallback. To replace the basemap, add an attributed equirectangular texture under `src/assets/` and change its import. The current map is visual context, not a dated scientific dataset.
- Pixel ratio is capped at 2, the container is observed for resize, animation pauses in hidden tabs, and resources are cleaned up for hot reload. Context loss shows a reload message. Desktop/mobile GPU performance still needs checking on target devices.

See [the inspection and scientific feature roadmap](docs/modernization.md) for the verified repository baseline, deployment decisions, and small extensions for observations, time, uncertainty, and larger datasets.

## Primary references

- [Original issue #1](https://github.com/SliveryMoonsmile/GlobeUX/issues/1)
- [Three.js installation and addons](https://threejs.org/manual/pages/installation.html)
- [three-globe API](https://vasturiano.github.io/three-globe/)
- [Vite static deployment](https://vite.dev/guide/static-deploy.html)
