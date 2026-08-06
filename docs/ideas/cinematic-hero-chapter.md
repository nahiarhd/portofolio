# Cinematic hero chapter + Orbital studio redesign

**Status:** superseded by [declassified-dossier.md](./declassified-dossier.md) (2026-08-05)  
**Reference:** [Noema / Orbital AI Studio](https://noema-ai-studio-74.aura.build/) (visual language, not a full HTML port)  
**Scope:** homepage visual overhaul — hero chapter + chrome + section layouts. IA and content preserved.

## Goal

Replace the split-layout hero with a **scroll-pinned chapter**: portrait stays centered while copy beats change, with orbital pink particle rings (Nexus-inspired).

## Approach

- **CSS sticky stage** inside a tall section (~4–5× viewport).
- **Canvas 2D** orbital rings (client island) — no second Three.js scene (shelf keeps WebGL).
- **Scroll progress** drives beat opacity via rAF reading section geometry (no React state per frame).
- **Portrait cutout** at `/portrait-cutout.png` (blue studio bg removed).
- **`prefers-reduced-motion`:** single static frame, last-beat content + CTAs visible, no particle loop / float.

## Beats

1. Name + location  
2. Tagline  
3. Bio  
4. CTAs (shelf + work list)

## Out of scope

GSAP, letterbox film bars as product UI, floating laptop prop, 7+ product marketing beats, second R3F scene.

## Performance

Canvas particle count capped for mid-range Android. Hero remains usable with JS disabled for text? — stage is client; critical name/tagline still in server HTML via noscript or first-beat SSR markup.
