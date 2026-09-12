# T-Drop

Next.js port of t-drop.net, a monthly t-shirt subscription for Bulgaria. Milestone v0.1 is a visual copy of the WordPress site. Billing, accounts and the CMS come in later milestones.

## Run

```bash
npm install
npm run dev
```

Node 22 LTS. Open the printed localhost URL.

## Compare with the old site

The WordPress backup runs on thebox in `~/tdrop-ref`. From this Mac:

```bash
ssh -f -N -L 127.0.0.1:18080:127.0.0.1:8080 thebox
```

Then open http://127.0.0.1:18080. Admin login at `/wp-admin`, user `admin`, password `admin`. Screenshots of both sites live in `reference/screenshots/`.

## Where to look

See [CLAUDE.md](CLAUDE.md) for the folder map, design tokens and the beads workflow.
