# Resizable and High-Resolution Rendering Plan

## Goal

Support true high-resolution gameplay while preserving the legacy `765x503` client frame as the compatibility mode.

The first practical target is a resizable mode with an expanded 3D game viewport and fixed-size legacy UI panels anchored around it. This mirrors later RuneScape-style resizable behavior without forcing every old interface to be rewritten up front.

## Current Constraints

- The canvas element is `765x503` logical pixels.
- The main 3D viewport is `512x334`, drawn at `4,4`.
- The minimap is `172x156`, drawn at `550,4`.
- The side panel is `190x261`, drawn at `553,205`.
- The chat panel is `479x96`, drawn at `17,357`.
- Most input, menu, and interface hit-testing directly uses those absolute coordinates.
- Interface archives are authored around fixed legacy dimensions, so old modal/interface widgets need compatibility placement rules.

## Architecture

1. Keep `legacy` layout as the baseline.
2. Introduce a single `ClientLayout` owner for frame, game, minimap, side, and chat rectangles.
3. Migrate rendering and hit-testing code from hardcoded coordinates to layout rectangles.
4. Add a `resizable` layout mode that computes:
   - canvas backing size from the browser viewport,
   - fixed-size minimap/sidebar/chat bounds,
   - expanded game viewport bounds using the remaining space,
   - legacy-centered compatibility bounds for fixed fullscreen interfaces.
5. Rebuild render targets when layout dimensions change:
   - `GameShell.drawArea`
   - `Client.areaGame`
   - scanline caches from `Pix3D.restoreClipping`
   - `World.resetVisCalc(...)` viewport dimensions
6. Convert input using the same layout rectangles:
   - world picking
   - interface options
   - minimenu placement
   - sidebar tabs
   - chat scroll/click regions
7. Move fullscreen interfaces last. Fixed archive interfaces should initially be centered or anchored inside the larger frame, then upgraded case-by-case.

## Migration Order

1. Add `ClientLayout` and route legacy-equivalent draw and input paths through it.
2. Replace core game viewport dimensions in `gameDrawMain`, `otherOverlays`, `buildMinimenu`, `openMenu`, and panel draw helpers.
3. Replace remaining hardcoded tab/chat/minimap click bounds with named rectangles.
4. Add resize detection in `GameShell`/`Client` and recreate backing `PixMap`s when dimensions change.
5. Enable resizable mode by default, with `?layout=legacy` available as a compatibility opt-out.
6. Validate world picking, menus, chat scrolling, inventory, fullscreen modals, and title/login screens.

## First Implementation Slice

The first slice is intentionally behavior-preserving:

- `ClientLayout` defines the legacy rectangles and helper methods.
- Core draw, interface, minimenu, and world-picking paths use the layout helper.
- The legacy compatibility output remains pixel-identical to the old fixed frame.

## Foundation Status

- Resizable mode is the default.
- `?layout=legacy` enables the fixed legacy frame as a compatibility path.
- `ClientLayout` now owns the active layout mode and computes a resizable frame from the browser viewport.
- `GameShell` listens for browser viewport changes in resizable mode, updates the canvas backing dimensions, rebuilds `GameShell.drawArea`, and calls `canvasResize(...)`.
- `public/index.html` switches the canvas CSS from legacy aspect-fit scaling to full-viewport sizing when the active frame is resizable.
- Loading, title, and login screens stay on the legacy backing frame; map/game/reconnect/fullscreen states switch to the resizable backing frame.
- `Client.ts` consumes `canvasResize(...)`, rebuilds client-owned frame PixMaps, resets panel redraw flags, and recalculates the world visibility viewport from the active game rectangle.
- The resizable game viewport now covers the full frame so the world renders behind fixed legacy panels instead of leaving an empty bottom/right gutter.
- `World` scales the tile visibility/render span to the loaded terrain radius for high-resolution viewports, stores that visibility grid compactly, and uses matching far-clip increases in the world/model projection path.
- High-memory scene building is the default so expanded views do not inherit low-memory floor/plane pruning artifacts.
- The loaded terrain area can be expanded with matching client/server settings:
  - Client: defaults to `2x`; `?buildAreaScale=1..4` or `?mapBuildAreaScale=1..4` can override it and the value persists in local storage.
  - Server: `loadedZoneScale` in `server-config.json`.
  - The client and server values must match for scaled terrain streaming. A rebuild packet with the wrong region count is treated as a configuration error instead of silently using a smaller loaded area.
  - `1x` preserves the legacy 13x13 zone build area. Higher values expand the centered radius; `4x` uses a 49x49 zone build area.
  - Static terrain streaming is expanded. Nearby actor visibility remains on the old protocol range until the 5-bit actor offset sync is redesigned.
