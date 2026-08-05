"use client";

/**
 * 3D clothbound shelf. One WebGL scene for the section lifetime.
 * Selection / open / page state lives in React and is mirrored into refs
 * so the animation loop never remounts the renderer.
 *
 * Motion craft (springs, striated page edges, painted env) adapted from
 * example/books — recolored to Ink & Signal (black mass + violet detail).
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import type { Locale } from "@/lib/locale";
import type { ShelfBook } from "@/lib/shelf-books";
import { cn } from "@/lib/utils";

type BookData = ShelfBook;

// Black cloth, violet foil — see docs/ideas/ink-and-signal.md.
const PALETTE = {
  void: "#08080a",
  ink: "#0e0e11",
  plank: "#141418",
  panel: "#1c1c21",
  paper: "#f4f4f5",
  paperText: "#18181b",
  paperMuted: "#52525b",
  accent: "#c084fc",
  accentSoft: "#a78bfa",
  text: "#fafafa",
  lightAmbient: 0xd4d4d8,
  lightKey: 0xffffff,
  lightFill: 0xa1a1aa,
  lightRim: 0x7c3aed,
} as const;

type ShelfState = "SHELF" | "INSPECT" | "READING";

/** Critical-damped-ish spring used for camera, pose, cover (from example/books). */
class Spring {
  v: number;
  t: number;
  vel: number;
  k: number;
  d: number;

  constructor(v = 0, k = 120, d = 14) {
    this.v = v;
    this.t = v;
    this.vel = 0;
    this.k = k;
    this.d = d;
  }

  set(v: number) {
    this.v = v;
    this.t = v;
    this.vel = 0;
    return this;
  }

  update(dt: number, snap = false) {
    if (snap) {
      this.v = this.t;
      this.vel = 0;
      return this.v;
    }
    const a = this.k * (this.t - this.v) - this.d * this.vel;
    this.vel += a * dt;
    this.v += this.vel * dt;
    return this.v;
  }
}

type BookSprings = {
  px: Spring;
  py: Spring;
  pz: Spring;
  rx: Spring;
  ry: Spring;
  rz: Spring;
  sc: Spring;
  cover: Spring;
};

type BookUserData = {
  index: number;
  bookData: BookData;
  frontCoverPivot: THREE.Group;
  pageSheets: THREE.Group[];
  pageBlock: THREE.Mesh;
  disposables: THREE.Object3D[];
  springs: BookSprings;
};

// BoxGeometry face order: +x, -x, +y, -y, +z, -z
function faceMaterials(
  right: THREE.Material,
  left: THREE.Material,
  top: THREE.Material,
  bottom: THREE.Material,
  front: THREE.Material,
  back: THREE.Material,
): THREE.Material[] {
  return [right, left, top, bottom, front, back];
}

function mkCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function createClothTexture(colorHex: string) {
  const canvas = mkCanvas(256, 256);
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, 256, 256);

  const imgData = ctx.getImageData(0, 0, 256, 256);
  const data = imgData.data;
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const idx = (y * 256 + x) * 4;
      const weave = (x % 4 < 2) === (y % 4 < 2) ? 10 : -10;
      const noise = (Math.random() - 0.5) * 10;
      const delta = weave + noise;
      data[idx] = Math.min(255, Math.max(0, data[idx] + delta));
      data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + delta));
      data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + delta));
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Fine warp threads for bump-like weave on cloth faces
  for (let i = 0; i < 256; i += 2) {
    ctx.fillStyle = i % 4 === 0 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
    ctx.fillRect(i, 0, 1, 256);
    ctx.fillRect(0, i, 256, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

/** Page-block edges: paper stack striations (from example/books). */
function createStriationTexture(vertical: boolean) {
  const s = 512;
  const canvas = mkCanvas(s, s);
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = "#ece4d2";
  ctx.fillRect(0, 0, s, s);
  let p = 0;
  while (p < s) {
    const w = 1 + Math.random() * 2.4;
    const tone = Math.random();
    ctx.fillStyle =
      tone < 0.12
        ? "rgba(140,125,95,0.5)"
        : tone < 0.5
          ? "rgba(255,255,252,0.55)"
          : "rgba(190,178,150,0.45)";
    if (vertical) ctx.fillRect(p, 0, w, s);
    else ctx.fillRect(0, p, s, w);
    p += w + 0.6 + Math.random() * 1.6;
  }
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = `rgba(120,108,84,${(Math.random() * 0.1).toFixed(3)})`;
    ctx.fillRect(Math.random() * s, Math.random() * s, 1.2, 1.2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

function createEndpaperTexture() {
  const s = 512;
  const canvas = mkCanvas(s, s);
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = "#f3edde";
  ctx.fillRect(0, 0, s, s);
  for (let i = 0; i < 1400; i++) {
    ctx.fillStyle = `rgba(120,105,70,${(0.04 + Math.random() * 0.08).toFixed(3)})`;
    ctx.fillRect(Math.random() * s, Math.random() * s, 1.4, 1.4);
  }
  const g = ctx.createLinearGradient(0, 0, s, 0);
  g.addColorStop(0, "rgba(0,0,0,0.07)");
  g.addColorStop(0.12, "rgba(0,0,0,0)");
  g.addColorStop(0.88, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.07)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Painted equirect studio: cool key + violet wash (not the books pink). */
function createStudioEnvTexture() {
  const canvas = mkCanvas(512, 256);
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "#2a2a32");
  g.addColorStop(0.5, "#141418");
  g.addColorStop(1, "#08080a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 256);

  const blob = (cx: number, cy: number, r: number, rgb: string, a: number) => {
    const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    rg.addColorStop(0, `rgba(${rgb},${a})`);
    rg.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  };
  blob(140, 66, 95, "255,255,255", 0.9);
  blob(400, 80, 55, "200,200,220", 0.4);
  blob(256, 140, 110, "124,58,237", 0.22); // violet atmosphere

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createFoilCoverCanvas(book: BookData, faceType: "front" | "spine" | "back") {
  const canvas = document.createElement("canvas");
  canvas.width = faceType === "spine" ? 256 : 1024;
  canvas.height = faceType === "spine" ? 1024 : 1400;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = book.clothColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < img.data.length; i += 16) {
    const d = (Math.random() - 0.5) * 8;
    img.data[i] = Math.min(255, Math.max(0, img.data[i]! + d));
    img.data[i + 1] = Math.min(255, Math.max(0, img.data[i + 1]! + d));
    img.data[i + 2] = Math.min(255, Math.max(0, img.data[i + 2]! + d));
  }
  ctx.putImageData(img, 0, 0);

  ctx.strokeStyle = book.foilColor;
  ctx.fillStyle = book.foilColor;

  if (faceType === "front") {
    ctx.lineWidth = 6;
    ctx.strokeRect(56, 56, canvas.width - 112, canvas.height - 112);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(72, 72, canvas.width - 144, canvas.height - 144);

    const cx = canvas.width / 2;
    const cy = 460;
    ctx.lineWidth = 5;
    ctx.beginPath();
    if (book.motif === "Latent Tree") {
      ctx.arc(cx, cy, 110, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(ang) * 110, cy + Math.sin(ang) * 110);
      }
      ctx.stroke();
    } else if (book.motif === "Agent Loop") {
      ctx.arc(cx, cy, 100, 0.2, Math.PI * 1.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 90, cy - 30);
      ctx.lineTo(cx + 100, cy);
      ctx.lineTo(cx + 70, cy - 10);
      ctx.fill();
    } else if (book.motif === "Graviton Mesh") {
      for (let r = 30; r <= 110; r += 28) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      ctx.strokeRect(cx - 90, cy - 90, 180, 180);
      ctx.beginPath();
      ctx.arc(cx, cy, 42, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.textAlign = "center";
    ctx.font = 'bold 72px Georgia, "Times New Roman", serif';
    ctx.fillText(book.title.toUpperCase(), cx, 800);
    ctx.font = 'italic 30px Georgia, "Times New Roman", serif';
    wrapCentered(ctx, book.subtitle, cx, 860, 720, 36);
    ctx.font = "500 22px ui-monospace, monospace";
    ctx.fillText(book.number.toUpperCase(), cx, 1080);
    ctx.fillText("EDITORIAL LIBRARY", cx, 1124);
  } else if (faceType === "spine") {
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.font = 'bold 42px Georgia, "Times New Roman", serif';
    ctx.fillText(book.title.toUpperCase(), 0, 8);
    ctx.font = "20px ui-monospace, monospace";
    ctx.fillText(book.number, 0, 48);
    ctx.restore();
  } else {
    ctx.lineWidth = 3;
    ctx.strokeRect(56, 56, canvas.width - 112, canvas.height - 112);
    ctx.textAlign = "center";
    ctx.font = "italic 30px Georgia, serif";
    const lines = [
      "Published by The Complete Shelf",
      "A dark editorial 3D library",
      "*",
      "Edition I - Clothbound",
    ];
    lines.forEach((line, i) => {
      ctx.fillText(line, canvas.width / 2, 580 + i * 56);
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function wrapCentered(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (let i = 0; i < words.length; i++) {
    const test = `${line}${words[i]} `;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), cx, yy);
      line = `${words[i]} `;
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), cx, yy);
}

function createPageSheetCanvas(pageData: { title: string; text: string }, isLeftPage: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = PALETTE.paper;
  ctx.fillRect(0, 0, 768, 1024);
  ctx.strokeStyle = "rgba(113, 113, 122, 0.14)";
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, 696, 952);

  if (isLeftPage) {
    ctx.fillStyle = PALETTE.paperText;
    ctx.font = "italic 26px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("THE COMPLETE SHELF", 384, 480);
    ctx.font = "16px ui-monospace, monospace";
    ctx.fillStyle = PALETTE.accentSoft;
    ctx.fillText("• EX LIBRIS •", 384, 528);
  } else {
    ctx.fillStyle = PALETTE.paperText;
    ctx.textAlign = "left";
    ctx.font = "bold 48px Georgia, serif";
    ctx.fillText(pageData.title, 72, 130);

    ctx.strokeStyle = PALETTE.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(72, 152);
    ctx.lineTo(220, 152);
    ctx.stroke();

    ctx.font = "400 26px system-ui, sans-serif";
    ctx.fillStyle = PALETTE.paperMuted;

    const paragraphs = pageData.text.split("\n\n");
    let y = 220;
    for (const para of paragraphs) {
      const words = para.split(" ");
      let line = "";
      for (let i = 0; i < words.length; i++) {
        const test = `${line}${words[i]} `;
        if (ctx.measureText(test).width > 600 && line) {
          ctx.fillText(line.trim(), 72, y);
          line = `${words[i]} `;
          y += 40;
        } else {
          line = test;
        }
      }
      ctx.fillText(line.trim(), 72, y);
      y += 56;
    }

    ctx.font = "16px ui-monospace, monospace";
    ctx.fillStyle = PALETTE.accentSoft;
    ctx.textAlign = "right";
    ctx.fillText(pageData.title.slice(0, 18), 700, 960);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function disposeObject(root: THREE.Object3D, sharedMaps?: Set<THREE.Texture>) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = mesh.material;
    if (!mat) return;
    const materials = Array.isArray(mat) ? mat : [mat];
    for (const m of materials) {
      const std = m as THREE.MeshStandardMaterial;
      if (std.map && !sharedMaps?.has(std.map)) std.map.dispose();
      m.dispose();
    }
  });
}

function buildBook(
  data: BookData,
  index: number,
  edgeV: THREE.Texture,
  edgeH: THREE.Texture,
  endpaper: THREE.Texture,
): THREE.Group {
  const group = new THREE.Group();
  const w = data.width;
  const h = data.height;
  const t = data.thickness;
  const boardT = 0.045;
  const disposables: THREE.Object3D[] = [];

  const clothMap = createClothTexture(data.clothColor);
  const clothMat = new THREE.MeshStandardMaterial({
    map: clothMap,
    color: 0xffffff,
    roughness: 0.72,
    metalness: 0.04,
  });

  const frontMap = createFoilCoverCanvas(data, "front");
  const spineMap = createFoilCoverCanvas(data, "spine");
  const backMap = createFoilCoverCanvas(data, "back");

  const frontMat = new THREE.MeshStandardMaterial({
    map: frontMap,
    roughness: 0.42,
    metalness: 0.28,
    envMapIntensity: 0.85,
  });
  const spineMat = new THREE.MeshStandardMaterial({
    map: spineMap,
    roughness: 0.42,
    metalness: 0.28,
    envMapIntensity: 0.85,
  });
  const backMat = new THREE.MeshStandardMaterial({
    map: backMap,
    roughness: 0.42,
    metalness: 0.28,
    envMapIntensity: 0.85,
  });

  const pageEdgeV = new THREE.MeshStandardMaterial({
    map: edgeV,
    color: 0xffffff,
    roughness: 0.92,
  });
  const pageEdgeH = new THREE.MeshStandardMaterial({
    map: edgeH,
    color: 0xffffff,
    roughness: 0.92,
  });
  const innerPaperMat = new THREE.MeshStandardMaterial({
    map: endpaper,
    color: 0xffffff,
    roughness: 0.95,
  });

  const spineMesh = new THREE.Mesh(
    new THREE.BoxGeometry(boardT, h, t),
    faceMaterials(clothMat, spineMat, clothMat, clothMat, clothMat, clothMat),
  );
  spineMesh.position.set(-w / 2 + boardT / 2, 0, 0);
  spineMesh.castShadow = true;
  group.add(spineMesh);
  disposables.push(spineMesh);

  const backMesh = new THREE.Mesh(
    new THREE.BoxGeometry(w - boardT, h, boardT),
    faceMaterials(clothMat, clothMat, clothMat, clothMat, clothMat, backMat),
  );
  backMesh.position.set(boardT / 2, 0, -t / 2 + boardT / 2);
  backMesh.castShadow = true;
  group.add(backMesh);
  disposables.push(backMesh);

  const frontCoverPivot = new THREE.Group();
  frontCoverPivot.position.set(-w / 2 + boardT, 0, t / 2 - boardT / 2);
  const frontGeo = new THREE.BoxGeometry(w - boardT, h, boardT);
  frontGeo.translate((w - boardT) / 2, 0, 0);
  const frontMesh = new THREE.Mesh(
    frontGeo,
    faceMaterials(clothMat, clothMat, clothMat, clothMat, frontMat, clothMat),
  );
  frontMesh.castShadow = true;
  frontCoverPivot.add(frontMesh);
  group.add(frontCoverPivot);
  disposables.push(frontMesh);

  const blockW = w - boardT - 0.08;
  const blockH = h - 0.1;
  const blockT = Math.max(t - boardT * 2 - 0.02, 0.08);
  // ±x fore-edge vertical striation; ±y head/foot horizontal
  const pageBlock = new THREE.Mesh(
    new THREE.BoxGeometry(blockW, blockH, blockT),
    faceMaterials(pageEdgeV, innerPaperMat, pageEdgeH, pageEdgeH, innerPaperMat, innerPaperMat),
  );
  pageBlock.position.set(boardT / 2 + 0.02, 0, 0);
  group.add(pageBlock);
  disposables.push(pageBlock);

  const numPages = data.pages.length;
  const pageSheets: THREE.Group[] = [];

  for (let i = 0; i < numPages; i++) {
    const pGeo = new THREE.PlaneGeometry(blockW, blockH, 16, 1);
    pGeo.translate(blockW / 2, 0, 0);

    const leftTex = createPageSheetCanvas(data.pages[Math.max(0, i - 1)]!, true);
    const rightTex = createPageSheetCanvas(data.pages[i]!, false);

    const pFrontMat = new THREE.MeshStandardMaterial({
      map: rightTex,
      roughness: 0.9,
      side: THREE.FrontSide,
    });
    const pBackMat = new THREE.MeshStandardMaterial({
      map: leftTex,
      roughness: 0.9,
      side: THREE.BackSide,
    });

    const pagePivot = new THREE.Group();
    const z = blockT / 2 - 0.01 - (i / Math.max(numPages - 1, 1)) * (blockT - 0.02);
    pagePivot.position.set(-w / 2 + boardT + 0.02, 0, z);

    const frontPage = new THREE.Mesh(pGeo, pFrontMat);
    const backPage = new THREE.Mesh(pGeo.clone(), pBackMat);
    pagePivot.add(frontPage);
    pagePivot.add(backPage);

    pagePivot.userData = {
      origPositions: Float32Array.from(pGeo.attributes.position.array as ArrayLike<number>),
      geo: pGeo,
      blockW,
    };

    pagePivot.visible = false;
    group.add(pagePivot);
    pageSheets.push(pagePivot);
    disposables.push(frontPage, backPage);
  }

  const restY = data.height / 2 - 1.1;
  const springs: BookSprings = {
    px: new Spring(0, 22, 7.2),
    py: new Spring(restY, 22, 7.2),
    pz: new Spring(0, 22, 7.2),
    rx: new Spring(0, 22, 7.2),
    ry: new Spring(0, 22, 7.2),
    rz: new Spring(0, 22, 7.2),
    sc: new Spring(1, 22, 7.2),
    cover: new Spring(0, 90, 12),
  };

  group.userData = {
    index,
    bookData: data,
    frontCoverPivot,
    pageSheets,
    pageBlock,
    disposables,
    springs,
  } satisfies BookUserData;

  group.traverse((obj) => {
    obj.userData.bookIndex = index;
  });

  return group;
}

const FOIL_CHIP =
  "inline-flex items-center justify-center rounded-full border border-primary/55 bg-surface-2/90 px-5 py-2.5 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-primary shadow-[inset_0_1px_0_rgba(192,132,252,0.25),0_8px_28px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-[background-color,border-color,color,box-shadow] duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]";

const FOIL_ICON =
  "flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 text-primary transition hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]";

export function ShelfExperience({
  lang,
  books,
  readLabel,
}: {
  lang: Locale;
  books: ShelfBook[];
  readLabel: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const openChipRef = useRef<HTMLButtonElement>(null);
  const chipScaleRef = useRef(new Spring(1, 190, 18));
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentState, setCurrentState] = useState<ShelfState>("SHELF");
  const [pageProgress, setPageProgress] = useState(0);
  const [hoverBook, setHoverBook] = useState(false);

  const selectedIndexRef = useRef(selectedIndex);
  const stateRef = useRef(currentState);
  const pageProgressRef = useRef(pageProgress);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
    stateRef.current = currentState;
    pageProgressRef.current = pageProgress;
  }, [selectedIndex, currentState, pageProgress]);

  // Spring-scale the Open chip when a book is under the pointer (example/books pill feel).
  useEffect(() => {
    if (currentState !== "SHELF") {
      chipScaleRef.current.set(1);
      if (openChipRef.current) openChipRef.current.style.transform = "scale(1)";
      return;
    }

    chipScaleRef.current.t = hoverBook ? 1.1 : 1;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let last = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const v = chipScaleRef.current.update(dt, reducedMotion);
      if (openChipRef.current) {
        openChipRef.current.style.transform = `scale(${v})`;
      }
      const settled =
        Math.abs(chipScaleRef.current.t - chipScaleRef.current.v) < 0.001 &&
        Math.abs(chipScaleRef.current.vel) < 0.01;
      if (!settled) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [hoverBook, currentState]);

  const selectedBook = books[Math.min(selectedIndex, Math.max(books.length - 1, 0))]!;

  useEffect(() => {
    const mountNode = containerRef.current;
    if (!mountNode) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const getSize = () => {
      const { clientWidth, clientHeight } = mountNode;
      return {
        width: Math.max(clientWidth, 1),
        height: Math.max(clientHeight, 1),
      };
    };

    const { width: startW, height: startH } = getSize();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(PALETTE.void);
    scene.fog = new THREE.FogExp2(0x08080a, 0.026);

    const camera = new THREE.PerspectiveCamera(36, startW / startH, 0.1, 80);
    const homeCam = { x: 0, y: 0.85, z: 6.8 };
    const inspectCam = { x: 0.55, y: 0.45, z: 4.1 };
    const homeLook = { x: 0, y: 0.15 };
    const inspectLook = { x: -0.35, y: 0.1 };

    const camX = new Spring(homeCam.x, 14, 6.8);
    const camY = new Spring(homeCam.y, 14, 6.8);
    const camZ = new Spring(homeCam.z, 14, 6.8);
    const lookX = new Spring(homeLook.x, 14, 6.8);
    const lookY = new Spring(homeLook.y, 14, 6.8);

    camera.position.set(homeCam.x, homeCam.y, homeCam.z);
    camera.lookAt(homeLook.x, homeLook.y, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(startW, startH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    // PCFSoftShadowMap is deprecated in three@0.185 — soft quality no longer differs.
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // Held under 1 so foil keeps printed saturation (example/books craft note)
    renderer.toneMappingExposure = 0.94;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountNode.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.cursor = "default";

    const pmrem = new THREE.PMREMGenerator(renderer);
    const equirect = createStudioEnvTexture();
    const envRT = pmrem.fromEquirectangular(equirect);
    scene.environment = envRT.texture;
    equirect.dispose();
    pmrem.dispose();

    scene.add(new THREE.AmbientLight(PALETTE.lightAmbient, 0.32));
    scene.add(new THREE.HemisphereLight(0xffffff, 0x141418, 0.5));

    const keyLight = new THREE.DirectionalLight(PALETTE.lightKey, 1.35);
    keyLight.position.set(4, 7.5, 5.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 24;
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(PALETTE.lightFill, 0.4);
    fillLight.position.set(-6, 2.2, -1.5);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(PALETTE.lightRim, 1.6, 16);
    rimLight.position.set(0, 3.2, -3);
    scene.add(rimLight);

    const frontFill = new THREE.DirectionalLight(0xe4e4e7, 0.3);
    frontFill.position.set(0, 2, 6);
    scene.add(frontFill);

    const shelfMat = new THREE.MeshStandardMaterial({
      color: PALETTE.plank,
      roughness: 0.72,
      metalness: 0.12,
    });
    const shelfMesh = new THREE.Mesh(new THREE.BoxGeometry(20, 0.28, 2.4), shelfMat);
    shelfMesh.position.set(0, -1.22, 0.1);
    shelfMesh.receiveShadow = true;
    shelfMesh.castShadow = true;
    scene.add(shelfMesh);

    const backBoard = new THREE.Mesh(
      new THREE.BoxGeometry(20, 3.2, 0.18),
      new THREE.MeshStandardMaterial({
        color: PALETTE.ink,
        roughness: 0.9,
        metalness: 0.05,
      }),
    );
    backBoard.position.set(0, 0.2, -1.1);
    backBoard.receiveShadow = true;
    scene.add(backBoard);

    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 6),
      new THREE.ShadowMaterial({ opacity: 0.55 }),
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0, -1.23, 0.2);
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 5),
      new THREE.MeshBasicMaterial({
        color: 0x6d28d9,
        transparent: true,
        opacity: 0.08,
      }),
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(0, -1.2, 0.5);
    scene.add(glow);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 2.8;
    controls.maxDistance = 8;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.enabled = false;
    controls.target.set(0, 0.15, 0);

    const edgeV = createStriationTexture(true);
    const edgeH = createStriationTexture(false);
    const endpaper = createEndpaperTexture();

    const bookMeshes: THREE.Group[] = books.map((data, index) => {
      const book = buildBook(data, index, edgeV, edgeH, endpaper);
      const restY = data.height / 2 - 1.1;
      const x = (index - (books.length - 1) / 2) * 1.75;
      book.position.set(x, restY, 0);
      const springs = (book.userData as BookUserData).springs;
      springs.px.set(x);
      springs.py.set(restY);
      springs.pz.set(0);
      scene.add(book);
      return book;
    });

    const bookSpacing = 1.75;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    let animationFrameId = 0;
    let disposed = false;
    let lastT = performance.now();
    let inspectSettled = false;

    const animate = () => {
      if (disposed) return;
      animationFrameId = requestAnimationFrame(animate);

      const now = performance.now();
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      const snap = reducedMotion;

      const sel = selectedIndexRef.current;
      const mode = stateRef.current;
      const pages = pageProgressRef.current;

      controls.enabled = mode !== "SHELF";
      if (mode === "SHELF") {
        inspectSettled = false;
        camX.t = homeCam.x;
        camY.t = homeCam.y;
        camZ.t = homeCam.z;
        lookX.t = homeLook.x;
        lookY.t = homeLook.y;
        camX.update(dt, snap);
        camY.update(dt, snap);
        camZ.update(dt, snap);
        lookX.update(dt, snap);
        lookY.update(dt, snap);
        camera.position.set(camX.v, camY.v, camZ.v);
        camera.lookAt(lookX.v, lookY.v, 0);
        controls.target.set(lookX.v, lookY.v, 0);
      } else if (!inspectSettled) {
        camX.t = inspectCam.x;
        camY.t = inspectCam.y;
        camZ.t = inspectCam.z;
        lookX.t = inspectLook.x;
        lookY.t = inspectLook.y;
        camX.update(dt, snap);
        camY.update(dt, snap);
        camZ.update(dt, snap);
        lookX.update(dt, snap);
        lookY.update(dt, snap);
        camera.position.set(camX.v, camY.v, camZ.v);
        camera.lookAt(lookX.v, lookY.v, 0.2);
        controls.target.set(lookX.v, lookY.v, 0.2);
        if (
          Math.hypot(camX.v - inspectCam.x, camY.v - inspectCam.y, camZ.v - inspectCam.z) < 0.08
        ) {
          inspectSettled = true;
        }
      }
      if (controls.enabled) controls.update();

      bookMeshes.forEach((mesh, idx) => {
        const data = mesh.userData as BookUserData;
        const s = data.springs;
        let rawOffset = idx - sel;
        while (rawOffset < -books.length / 2) rawOffset += books.length;
        while (rawOffset > books.length / 2) rawOffset -= books.length;

        const isSelected = idx === sel;
        const restY = data.bookData.height / 2 - 1.1;

        if (mode === "SHELF") {
          s.px.t = rawOffset * bookSpacing;
          s.pz.t = Math.abs(rawOffset) < 0.5 ? 0.4 : 0;
          s.py.t = restY;
          s.rx.t = 0;
          s.ry.t = 0;
          s.rz.t = 0;
          s.sc.t = isSelected ? 1.05 : 1;
          mesh.visible = true;
        } else if (isSelected) {
          s.px.t = -0.55;
          s.py.t = data.bookData.height / 2 - 1.05;
          s.pz.t = 0.55;
          s.rx.t = 0.08;
          s.ry.t = 0.55;
          s.rz.t = 0;
          s.sc.t = 1.08;
          mesh.visible = true;
        } else {
          s.pz.t = -2.5;
          s.py.t = restY;
          mesh.visible = Math.abs(s.pz.v + 2.5) > 0.04;
        }

        let coverTarget = 0;
        let pageTarget = 0;
        if (isSelected && mode === "INSPECT") coverTarget = -0.25;
        else if (isSelected && mode === "READING") {
          coverTarget = -Math.PI * 0.88;
          pageTarget = pages;
        }
        s.cover.t = coverTarget;

        s.px.update(dt, snap);
        s.py.update(dt, snap);
        s.pz.update(dt, snap);
        s.rx.update(dt, snap);
        s.ry.update(dt, snap);
        s.rz.update(dt, snap);
        s.sc.update(dt, snap);
        s.cover.update(dt, snap);

        mesh.position.set(s.px.v, s.py.v, s.pz.v);
        mesh.rotation.set(s.rx.v, s.ry.v, s.rz.v);
        mesh.scale.setScalar(s.sc.v);

        const coverPivot = data.frontCoverPivot;
        coverPivot.rotation.y = s.cover.v;

        const openEnough = Math.abs(coverPivot.rotation.y) > 0.4;
        data.pageBlock.visible = !openEnough || mode !== "READING";

        data.pageSheets.forEach((sheet, sIdx) => {
          sheet.visible = isSelected && mode === "READING" && openEnough;
          if (!sheet.visible) {
            sheet.rotation.y = THREE.MathUtils.lerp(sheet.rotation.y, 0, snap ? 1 : 0.18);
            return;
          }

          const sheetProgress = THREE.MathUtils.clamp(pageTarget - sIdx, 0, 1);
          const targetAngle = -sheetProgress * Math.PI * 0.9;
          sheet.rotation.y = THREE.MathUtils.lerp(
            sheet.rotation.y,
            targetAngle,
            snap ? 1 : 0.16,
          );

          const geo = sheet.userData.geo as THREE.BufferGeometry;
          const posAttr = geo.attributes.position as THREE.BufferAttribute;
          const orig = sheet.userData.origPositions as Float32Array;
          const blockW = sheet.userData.blockW as number;
          const currentRot = Math.abs(sheet.rotation.y);
          const bendAmount = Math.sin((currentRot / (Math.PI * 0.9)) * Math.PI) * 0.1;

          for (let v = 0; v < posAttr.count; v++) {
            const vx = orig[v * 3]!;
            const u = vx / blockW;
            posAttr.setZ(v, Math.sin(u * Math.PI) * bendAmount);
          }
          posAttr.needsUpdate = true;
        });
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const { width, height } = getSize();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mountNode);

    const pickBook = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(bookMeshes, true);
      if (hits.length === 0) return null;
      const idx = hits[0]!.object.userData.bookIndex as number | undefined;
      return typeof idx === "number" ? idx : null;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (stateRef.current !== "SHELF") return;
      const idx = pickBook(event.clientX, event.clientY);
      if (idx === null) return;
      setSelectedIndex(idx);
      setCurrentState("INSPECT");
      setPageProgress(0);
    };
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    let wheelCooldown = 0;
    const onWheel = (event: WheelEvent) => {
      if (stateRef.current !== "SHELF") return;
      event.preventDefault();
      const t = performance.now();
      if (t < wheelCooldown) return;
      wheelCooldown = t + 280;
      if (event.deltaY > 4) {
        setSelectedIndex((i) => (i + 1) % books.length);
      } else if (event.deltaY < -4) {
        setSelectedIndex((i) => (i - 1 + books.length) % books.length);
      }
    };
    mountNode.addEventListener("wheel", onWheel, { passive: false });

    let lastHoverIdx: number | null | undefined = undefined;
    const onPointerMove = (event: PointerEvent) => {
      if (stateRef.current !== "SHELF") {
        renderer.domElement.style.cursor = controls.enabled ? "grab" : "default";
        if (lastHoverIdx !== null && lastHoverIdx !== undefined) {
          lastHoverIdx = null;
          setHoverBook(false);
        }
        return;
      }
      const idx = pickBook(event.clientX, event.clientY);
      renderer.domElement.style.cursor = idx === null ? "default" : "pointer";
      if (idx === lastHoverIdx) return;
      lastHoverIdx = idx;
      setHoverBook(idx !== null);
      // Hover selects so Open / bottom chrome match the book under the cursor.
      if (idx !== null) setSelectedIndex(idx);
    };
    renderer.domElement.addEventListener("pointermove", onPointerMove);

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      mountNode.removeEventListener("wheel", onWheel);
      controls.dispose();
      const sharedMaps = new Set<THREE.Texture>([edgeV, edgeH, endpaper]);
      bookMeshes.forEach((book) => {
        disposeObject(book, sharedMaps);
        scene.remove(book);
      });
      edgeV.dispose();
      edgeH.dispose();
      endpaper.dispose();
      envRT.dispose();
      disposeObject(shelfMesh);
      disposeObject(backBoard);
      disposeObject(shadowPlane);
      disposeObject(glow);
      renderer.dispose();
      if (mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, [books]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentState === "SHELF") {
          setSelectedIndex((i) => (i - 1 + books.length) % books.length);
        } else if (currentState === "READING") {
          setPageProgress((prev) => {
            const next = Math.max(prev - 1, 0);
            if (next <= 0) setCurrentState("INSPECT");
            return next;
          });
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (currentState === "SHELF") {
          setSelectedIndex((i) => (i + 1) % books.length);
        } else if (currentState === "READING") {
          setPageProgress((prev) => Math.min(prev + 1, selectedBook.pages.length));
        }
      } else if (e.key === "Enter" && currentState === "SHELF") {
        setCurrentState("INSPECT");
      } else if (e.key === "Escape") {
        if (currentState === "READING") {
          setCurrentState("INSPECT");
          setPageProgress(0);
        } else if (currentState === "INSPECT") {
          setCurrentState("SHELF");
          setPageProgress(0);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentState, selectedBook.pages.length, books.length]);

  const handlePrev = () =>
    setSelectedIndex((prev) => (prev - 1 + books.length) % books.length);
  const handleNext = () => setSelectedIndex((prev) => (prev + 1) % books.length);

  const handleInspect = () => {
    setCurrentState("INSPECT");
    setPageProgress(0);
  };

  const handleReturn = () => {
    setCurrentState("SHELF");
    setPageProgress(0);
  };

  const handleToggleOpen = () => {
    if (currentState === "INSPECT") {
      setCurrentState("READING");
      setPageProgress(0.15);
    } else {
      setCurrentState("INSPECT");
      setPageProgress(0);
    }
  };

  const handleNextPage = () => {
    setPageProgress((prev) => Math.min(prev + 1, selectedBook.pages.length));
  };

  const handlePrevPage = () => {
    setPageProgress((prev) => {
      const next = Math.max(prev - 1, 0);
      if (next <= 0) setCurrentState("INSPECT");
      return next;
    });
  };

  const volumeIndex = String(selectedIndex + 1).padStart(2, "0");
  const volumeTotal = String(books.length).padStart(2, "0");
  const detailOpen = currentState !== "SHELF";

  return (
    <div
      className="relative min-h-[100dvh] w-full overflow-hidden text-foreground"
      style={{ background: PALETTE.void }}
      role="region"
      aria-label="The Complete Shelf"
      data-detail={detailOpen ? "open" : "shelf"}
    >
      <div ref={containerRef} className="absolute inset-0 z-0" />

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background: `
            linear-gradient(180deg, rgba(8,8,10,0.55) 0%, transparent 22%),
            linear-gradient(0deg, rgba(8,8,10,0.7) 0%, transparent 28%),
            radial-gradient(ellipse at 50% 40%, ${selectedBook.clothColor}55 0%, transparent 62%)
          `,
        }}
        aria-hidden
      />

      <header
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-6 px-5 pt-20 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-8 sm:pt-24",
          detailOpen && "opacity-40 -translate-y-2 sm:opacity-100 sm:translate-y-0",
        )}
      >
        <div>
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground">
            Editorial library
          </p>
          <h2 className="mt-1 font-display text-2xl font-medium tracking-tight text-foreground sm:text-[1.75rem]">
            The Complete Shelf
            <span className="ml-2 align-middle border border-border bg-surface-2/80 px-2 py-0.5 font-mono text-[0.6rem] font-normal uppercase tracking-[0.14em] text-muted-foreground">
              {books.length} volumes
            </span>
          </h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Black clothbound - browse, inspect, open.
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-muted-foreground">
            Edition 01 - 2026
          </p>
          <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-primary/70">
            From the work
          </p>
        </div>
      </header>

      {/* Shelf chrome: volume strip + foil Open chip */}
      {currentState === "SHELF" && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-5 sm:px-8 sm:pb-7">
          <div className="pointer-events-auto mx-auto grid max-w-5xl grid-cols-1 items-end gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-6">
            <div className="flex min-w-0 items-start gap-3">
              <span className="pt-1.5 font-mono text-[0.58rem] tabular-nums tracking-[0.12em] text-muted-foreground">
                {volumeIndex} / {volumeTotal}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-2xl tracking-tight text-foreground sm:text-3xl sm:leading-none">
                  {selectedBook.title}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {selectedBook.subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 sm:justify-self-center">
              <button type="button" onClick={handlePrev} className={FOIL_ICON} aria-label="Previous volume">
                <span aria-hidden>{"←"}</span>
              </button>
              <button
                ref={openChipRef}
                type="button"
                onClick={handleInspect}
                className={cn(
                  FOIL_CHIP,
                  "origin-center will-change-transform",
                  hoverBook && "border-primary bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_10px_32px_rgba(124,58,237,0.35)]",
                )}
              >
                Open
              </button>
              <button type="button" onClick={handleNext} className={FOIL_ICON} aria-label="Next volume">
                <span aria-hidden>{"→"}</span>
              </button>
            </div>

            <nav className="flex flex-col items-start gap-2 sm:items-end" aria-label="Volume index">
              <div className="flex items-center gap-1" role="tablist">
                {books.map((book, idx) => (
                  <button
                    key={book.id}
                    type="button"
                    role="tab"
                    aria-selected={idx === selectedIndex}
                    aria-label={`Volume ${idx + 1}: ${book.title}`}
                    onClick={() => setSelectedIndex(idx)}
                    className="flex h-7 w-6 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <span
                      className={cn(
                        "block h-0.5 rounded-full transition-all",
                        idx === selectedIndex ? "w-5 bg-primary" : "w-3 bg-primary/35 hover:bg-primary/70",
                      )}
                    />
                  </button>
                ))}
              </div>
              <p className="font-mono text-[0.53rem] uppercase tracking-[0.14em] text-primary/60">
                Wheel - arrows - click book
              </p>
            </nav>
          </div>
        </div>
      )}

      {/* Detail: desktop right rail, mobile bottom sheet + staggered reveal */}
      {detailOpen && (
        <aside
          className={cn(
            "pointer-events-auto absolute z-10 flex max-h-[min(72vh,36rem)] flex-col overflow-y-auto border border-border/80 bg-surface-1/90 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-md",
            // Mobile: bottom sheet
            "inset-x-3 bottom-3 rounded-2xl p-5",
            // Desktop: right panel
            "sm:inset-x-auto sm:bottom-auto sm:right-8 sm:top-28 sm:w-[min(34vw,26rem)] sm:rounded-2xl sm:p-6",
          )}
          aria-live="polite"
          role="dialog"
          aria-label={selectedBook.title}
        >
          <div
            className="shelf-detail-stagger flex items-start justify-between gap-3"
            style={{ animationDelay: "0.05s" }}
          >
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground">
              {selectedBook.number}
            </p>
            <button
              type="button"
              onClick={handleReturn}
              className={FOIL_ICON}
              aria-label="Return to shelf"
            >
              ×
            </button>
          </div>
          <h3
            className="shelf-detail-stagger mt-2 font-display text-3xl font-medium leading-[0.95] tracking-tight text-primary sm:text-4xl md:text-5xl"
            style={{ animationDelay: "0.12s" }}
          >
            {selectedBook.title}
          </h3>
          <p
            className="shelf-detail-stagger mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base"
            style={{ animationDelay: "0.2s" }}
          >
            {selectedBook.description}
          </p>

          <dl
            className="shelf-detail-stagger mt-6 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-border pt-5"
            style={{ animationDelay: "0.28s" }}
          >
            {(
              [
                ["Binding", selectedBook.binding],
                ["Stack", selectedBook.paper],
                ["Extent", selectedBook.extent],
                ["Pillar", selectedBook.motif],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-primary/65">
                  {label}
                </dt>
                <dd className="mt-1 text-xs leading-snug text-foreground">{value}</dd>
              </div>
            ))}
          </dl>

          <div
            className="shelf-detail-stagger mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-5"
            style={{ animationDelay: "0.34s" }}
          >
            <Link
              href={`/${lang}/work/${selectedBook.slug}`}
              className={cn(FOIL_CHIP, "bg-primary text-primary-foreground border-primary")}
            >
              {readLabel}
            </Link>
            <button type="button" onClick={handleToggleOpen} className={FOIL_CHIP}>
              {currentState === "READING" ? "Close book" : "Open book"}
            </button>
            {currentState === "READING" && (
              <>
                <button
                  type="button"
                  onClick={handlePrevPage}
                  className="rounded-full border border-border px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  Prev page
                </button>
                <button
                  type="button"
                  onClick={handleNextPage}
                  className="rounded-full border border-border px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  Next page
                </button>
              </>
            )}
          </div>
          <p
            className="shelf-detail-stagger mt-4 font-mono text-[0.53rem] uppercase tracking-[0.12em] text-primary/55"
            style={{ animationDelay: "0.4s" }}
          >
            Drag to orbit - Esc returns to shelf
          </p>
        </aside>
      )}
    </div>
  );
}
