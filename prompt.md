**Build a 3D Vault Visualizer web app using Three.js (single HTML file, no build step).**

The app visualizes a monetary amount as physical stacks of cash in a 3D vault room. Port and extend this existing 2D canvas version: [paste your HTML file contents here]

**Core requirements:**
- 3D vault room (floor, walls, ceiling) with dark aesthetic and warm tungsten point lighting with shadows
- Bill stacks as BoxGeometry cuboids; stacks cap at 2m height then new columns form beside each other
- Orbit controls (mouse drag to rotate, scroll to zoom) — slow auto-orbit on load, stops on user interaction
- Human stick figure or simple mannequin for scale reference (1.75m)
- Floating billboard labels above each stack showing height
- Same currency/denomination selector: USD ($100/$50/$20/$1), AUD ($100/$50/$20), INR (₹500/₹2000/₹100), GBP (£50/£20), EUR (€100/€50)
- Each currency has a distinct bill color (greens for USD, orange-yellow for AUD, blue for INR, purple for GBP, blue for EUR)
- Stats bar below canvas: total notes, stack count, total height, volume, weight
- Quick-amount buttons: $10K, $100K, $1M, $10M, $1B

**Visual details:**
- Vault room: charcoal walls `#1a1a1a`, warm floor `#2d2a1e`, ceiling at 3m
- Stacks slightly imperfect — vary top surface with a thin "fanned" cap layer
- Point light above casting long floor shadows; ambient fill light at low intensity
- Dark overall UI matching the existing design (Space Grotesk + Space Mono fonts, `#d4a843` gold accent)

**Real-world note dimensions (mm) to use for volume/weight calc:**
USD 156×66×0.109mm, AUD 158×65×0.1mm, INR ₹500 150×66×0.1mm, INR ₹2000 166×66×0.1mm, GBP 156×85×0.1mm, EUR 147×82×0.1mm. Weight: 1g per note.

**Deliverable:** single `index.html` file, Three.js + OrbitControls from CDN, no npm/build step required.
