# OT service systems — React 3D demo

An interactive 3D concept built with React, Vite, Three.js, React Three Fiber and Drei. It has separate tabs for the original layout, foldable arms and pipes, Bluetooth monitoring, ceiling service, and floor service. The room includes a patient, two doctors, anaesthesia machine, ECG module, pulse oximetry module, BP module, patient monitor, cautery unit, suction equipment and a breathing/ventilation tube.

## Requirements

- Node.js 20.19+ or 22.12+ (Node.js 22 LTS is a convenient choice)
- npm (included with Node.js)
- An internet connection for the first `npm install`
- A browser with WebGL enabled

**No Python virtual environment is needed.** JavaScript projects use `node_modules` for project-local packages, and `package-lock.json` locks their versions.

## Install and run

1. Download and unzip this folder.
2. Open a terminal in the `OT_React_3D` folder.
3. Run:

```bash
npm install
npm run dev
```

4. Open the local URL shown by Vite, usually `http://localhost:5173`.

To build files for a laptop presentation after installation:

```bash
npm run build
npm run preview
```

Open the preview URL shown in the terminal. The built app in `dist/` has no runtime dependency on the internet, but serve it through `npm run preview` rather than double-clicking `dist/index.html`.

## Demonstration sequence

1. Before: show the original loose connections with all equipment, patient and doctors.
2. Overview: orbit the room to establish the proposed routes.
3. Expandable wires & pipes: press **Play extend / retract** to show the wire stretching out and returning to the reel. Move **Extend support** and **Bend at hinge** yourself to show the hinged and telescoping supports.
4. Bluetooth monitoring: show the separate ECG, SpO₂ and BP data routes. Explain that body sensors still need physical contact.
5. Ceiling service: inspect the pendant and local connection points above the table.
6. Floor service: open the service panel to show color-coded routes, junction points, and power and suction outlets near the table.

The tubes and supports are illustrative 3D models, not mechanical or clinical designs. The service interval and any actual routing require specialist approval.
