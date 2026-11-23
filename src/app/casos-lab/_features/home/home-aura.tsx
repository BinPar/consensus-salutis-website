"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

const vertex = `attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`;
// Smooth suspended colour patches; the subtle Prisma study retains its existing planes.
const fragment = `
precision highp float;
uniform vec2 resolution;
uniform vec2 pointer;
uniform float time;
uniform float dark;
uniform float subtle;
uniform float density;
uniform vec3 clearings[8];
float oil(vec2 p,vec2 centre,vec2 axes,float angle){
  vec2 d=p-centre;
  d=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*d;
  return smoothstep(.08,.72,exp(-dot(d*axes,d*axes)*2.));
}
void main(){
  vec2 uv=gl_FragCoord.xy/resolution;
  vec2 p=(uv-.5)*vec2(resolution.x/resolution.y,1.);
  p+=pointer*vec2(.025,.018);
  float t=time*.32;
  float angle=.48+sin(t*.61)*.22;
  float a=dot(p,vec2(cos(angle),sin(angle)));
  float b=dot(p,vec2(-.62,.78));
  float c=dot(p,vec2(.35,-.94));
  float teal=1.-smoothstep(-.20,.20,a+.48*sin(t));
  float blue=smoothstep(-.16,.24,b+.43*cos(t*.87));
  float mint=smoothstep(-.12,.32,c+.40*sin(t*.93+1.7));
  vec3 ground=mix(mix(vec3(.956,.976,.988),vec3(1.),subtle),vec3(.024,.067,.122),dark);
  vec3 color=mix(ground,mix(vec3(.50,.77,.80),vec3(.025,.28,.32),dark),teal*.9);
  color=mix(color,mix(vec3(.58,.74,.88),vec3(.055,.20,.35),dark),blue*.83);
  color=mix(color,mix(vec3(.69,.87,.78),vec3(.025,.33,.27),dark),mint*.82);
  if(subtle<.5){
    float aspect=resolution.x/resolution.y;
    vec3 white=mix(vec3(.992,.997,1.),ground,dark);
    // Canonical brand colours, diluted into the background rather than new pastel hues.
    vec3 brandTeal=vec3(0.,109.,121.)/255.; // #006d79
    vec3 brandCyan=vec3(8.,145.,178.)/255.; // #0891b2, the site signal-field colour
    vec3 brandTurquoise=vec3(0.,188.,187.)/255.; // #00bcbb
    vec3 tealTint=mix(mix(white,brandTeal,.38),mix(ground,brandTurquoise,.30),dark);
    vec3 cyanTint=mix(mix(white,brandCyan,.30),mix(ground,brandTurquoise,.25),dark);
    vec3 paleTeal=mix(mix(white,brandTeal,.27),mix(ground,brandTurquoise,.23),dark);
    // Each patch traverses the viewport on its own continuous, broad trajectory.
    float phase=time*6.2831853/36.;
    vec2 centreA=vec2(-cos(phase)*aspect*.43,sin(phase)*.38);
    vec2 centreB=vec2(cos(phase*.86+1.8)*aspect*.34,sin(phase*.86+1.8)*.46);
    vec2 centreC=vec2(cos(phase*.78+3.8)*aspect*.44,sin(phase*.78+3.8)*.34);
    vec2 centreD=vec2(cos(phase*.65+5.2)*aspect*.35,sin(phase*.65+5.2)*.29);
    float tealOil=oil(p,centreA,vec2(1.6,1.3),phase*.15);
    float cyanOil=oil(p,centreB,vec2(1.25,1.9),.4-phase*.12);
    float paleOil=oil(p,centreC,vec2(1.5,1.7),-.35+phase*.1);
    float lowerOil=oil(p,centreD,vec2(1.5,1.8),.5-phase*.09);
    color=mix(white,tealTint,tealOil*.92);
    color=mix(color,cyanTint,cyanOil*.90);
    color=mix(color,paleTeal,paleOil*.91);
    color=mix(color,tealTint,lowerOil*.74);
    float poolA=oil(p,(centreA+centreB)*.5,vec2(2.6,3.7),-.3);
    float poolB=oil(p,(centreC+centreD)*.5,vec2(3.0,3.8),.5);
    float pools=max(poolA,poolB);
    color=mix(color,white,pools*.28);
    // Only repeated movement leaves a subtle clearing, anchored to the visited region.
    float whitening=0.;
    for(int i=0;i<8;i++){
      if(clearings[i].z>.001){
        vec2 local=p-clearings[i].xy;
        whitening=max(whitening,clearings[i].z*exp(-dot(local,local)*38.));
      }
    }
    color=mix(color,white,whitening*.34);
  }
  // Keep the reading area centered; only the surrounding colour planes travel.
  vec2 readingPoint=(uv-vec2(.5,.52))*vec2(resolution.x/resolution.y,1.);
  float reading=1.-smoothstep(.22,.85,length(readingPoint*vec2(1.05,2.2)));
  color=mix(color,mix(vec3(.984,.992,1.),ground,dark),reading*mix(.84,.98,subtle));
  // The Prisma study keeps Aura's moving colour planes, diluted with white.
  color=mix(color,mix(vec3(1.),ground,dark),subtle*.70);
  if(subtle<.5){
    // Reveal the same 44px grid only where the background reaches its clearest white.
    vec2 pixel=vec2(uv.x,1.-uv.y)*resolution/density-.5/density;
    vec2 cell=min(fract(pixel/44.),1.-fract(pixel/44.))*44.;
    float grid=1.-smoothstep(.25,.90,min(cell.x,cell.y));
    float whiteDepth=smoothstep(.935,.98,min(color.r,min(color.g,color.b)));
    float darkDepth=1.-smoothstep(.10,.25,max(color.r,max(color.g,color.b)));
    float revealed=mix(whiteDepth,darkDepth,dark);
    vec3 gridInk=mix(vec3(8.,145.,178.)/255.,vec3(125.,211.,252.)/255.,dark);
    color=mix(color,gridInk,grid*revealed*mix(.10,.04,dark));
  }
  gl_FragColor=vec4(color,1.);
}`;

type ColourRegion = { x: number; y: number; energy: number; at: number };
function decayRegions(regions: Map<string, ColourRegion>, now: number) {
  regions.forEach((region, key) => {
    region.energy *= Math.exp(-(now - region.at) / 3600);
    region.at = now;
    if (region.energy < 0.004) regions.delete(key);
  });
}
function addRegionMovement(
  regions: Map<string, ColourRegion>,
  previous: { x: number; y: number } | null,
  point: { x: number; y: number },
  width: number,
  height: number,
  now: number,
) {
  decayRegions(regions, now);
  if (!previous || !width || !height) return;
  const distance = Math.hypot(point.x - previous.x, point.y - previous.y);
  if (distance < 1 || distance > 90) return;
  const column = Math.floor(point.x / 160),
    row = Math.floor(point.y / 160),
    key = `${column}:${row}`;
  const region = regions.get(key) ?? {
    x: (column * 160 + 80) / width,
    y: (row * 160 + 80) / height,
    energy: 0,
    at: now,
  };
  region.energy = Math.min(1, region.energy + Math.min(distance, 24) * 0.0014);
  region.at = now;
  regions.set(key, region);
  if (regions.size > 16) {
    const weakest = [...regions.entries()].sort(
      (a, b) => a[1].energy - b[1].energy,
    )[0];
    if (weakest) regions.delete(weakest[0]);
  }
}

export function HomeAura({
  running,
  pointer,
  subtle = false,
  stationary = false,
}: {
  running: boolean;
  pointer: RefObject<{ x: number; y: number }>;
  subtle?: boolean;
  stationary?: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [contextVersion, setContextVersion] = useState(0);
  const [fallback, setFallback] = useState(false);
  const time = useRef(0);
  const position = useRef({ x: 0, y: 0 });
  const regions = useRef(new Map<string, ColourRegion>());
  const lastMovement = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const element = canvas.current;
    const gl = element?.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!element || !gl) {
      setFallback(true);
      return;
    }
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, vertex),
      fs = compile(gl.FRAGMENT_SHADER, fragment);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
      if (program) gl.deleteProgram(program);
      setFallback(true);
      return;
    }
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      setFallback(true);
      return;
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const attribute = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
    const uniforms = {
      resolution: gl.getUniformLocation(program, "resolution"),
      pointer: gl.getUniformLocation(program, "pointer"),
      time: gl.getUniformLocation(program, "time"),
      dark: gl.getUniformLocation(program, "dark"),
      subtle: gl.getUniformLocation(program, "subtle"),
      density: gl.getUniformLocation(program, "density"),
      clearings: gl.getUniformLocation(program, "clearings[0]"),
    };
    let frame = 0,
      last = 0;
    const regionData = new Float32Array(24);
    const draw = () => {
      gl.uniform2f(uniforms.resolution, element.width, element.height);
      gl.uniform2f(
        uniforms.pointer,
        stationary ? 0 : position.current.x,
        stationary ? 0 : position.current.y,
      );
      gl.uniform1f(uniforms.time, stationary ? 0 : time.current);
      gl.uniform1f(uniforms.subtle, subtle ? 1 : 0);
      gl.uniform1f(
        uniforms.density,
        element.width / Math.max(element.clientWidth, 1),
      );
      decayRegions(regions.current, performance.now());
      regionData.fill(0);
      [...regions.current.values()]
        .sort((a, b) => b.energy - a.energy)
        .slice(0, 8)
        .forEach((region, index) => {
          const amount = Math.max(0, Math.min(1, (region.energy - 0.15) / 0.7));
          regionData[index * 3] =
            ((region.x - 0.5) * element.width) / Math.max(element.height, 1);
          regionData[index * 3 + 1] = 0.5 - region.y;
          regionData[index * 3 + 2] = amount * amount * (3 - 2 * amount);
        });
      gl.uniform3fv(uniforms.clearings, regionData);
      gl.uniform1f(
        uniforms.dark,
        document.documentElement.classList.contains("dark") ? 1 : 0,
      );
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const resize = () => {
      const r = element.getBoundingClientRect(),
        ratio = Math.min(devicePixelRatio || 1, 1.25);
      element.width = Math.round(r.width * ratio);
      element.height = Math.round(r.height * ratio);
      gl.viewport(0, 0, element.width, element.height);
      draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    const theme = new MutationObserver(draw);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const lost = (event: Event) => {
      event.preventDefault();
      element.style.opacity = "0";
      cancelAnimationFrame(frame);
    };
    const restored = () => {
      element.style.opacity = "1";
      setContextVersion((value) => value + 1);
    };
    element.addEventListener("webglcontextlost", lost);
    element.addEventListener("webglcontextrestored", restored);
    const surface = element.closest<HTMLElement>("[data-home-proposal]");
    const disperse = (event: PointerEvent) => {
      if (subtle || event.pointerType !== "mouse" || document.hidden) return;
      const bounds = element.getBoundingClientRect();
      const point = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };
      addRegionMovement(
        regions.current,
        lastMovement.current,
        point,
        bounds.width,
        bounds.height,
        performance.now(),
      );
      lastMovement.current = point;
      if (!running) draw();
    };
    const closeOpening = () => {
      lastMovement.current = null;
      if (!running) {
        regions.current.clear();
        draw();
      }
    };
    if (!stationary) {
      surface?.addEventListener("pointermove", disperse);
      surface?.addEventListener("pointerleave", closeOpening);
    }
    if (running && !stationary) {
      const tick = (now: number) => {
        if (!last || now - last >= 40) {
          time.current += last ? Math.min((now - last) / 1000, 0.1) : 0;
          last = now;
          position.current.x += (pointer.current.x - position.current.x) * 0.06;
          position.current.y += (pointer.current.y - position.current.y) * 0.06;
          draw();
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      theme.disconnect();
      surface?.removeEventListener("pointermove", disperse);
      surface?.removeEventListener("pointerleave", closeOpening);
      element.removeEventListener("webglcontextlost", lost);
      element.removeEventListener("webglcontextrestored", restored);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [running, pointer, contextVersion, subtle, stationary]);
  return (
    <div
      className="home-aura-field"
      data-fallback={fallback}
      data-subtle={subtle}
      data-stationary={stationary}
      aria-hidden="true"
    >
      <canvas ref={canvas} style={fallback ? { display: "none" } : undefined} />
      {fallback && (
        <>
          <div className="home-aura-fallback" />
          {!stationary && <div className="home-aura-cursor-wash" />}
        </>
      )}
      {!subtle && !stationary && <AuraCursorNodes />}
    </div>
  );
}

function AuraCursorNodes() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    const surface = element?.closest<HTMLElement>("[data-home-proposal]");
    const ctx = element?.getContext("2d");
    if (!element || !surface || !ctx) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      width = 0,
      height = 0,
      ratio = 1,
      previous = 0;
    let x = 0,
      y = 0,
      active = false;
    let trail: { x: number; y: number; at: number }[] = [];
    const duration = 1400;
    const fallbackRegions = new Map<string, ColourRegion>();
    let fallbackPrevious: { x: number; y: number } | null = null;
    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      active = false;
      trail = [];
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
    };
    const paint = (now: number) => {
      frame = 0;
      previous = now;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      // Place hairlines on physical pixel centres, including Safari's canvas renderer.
      ctx.setTransform(ratio, 0, 0, ratio, 0.5, 0.5);
      trail = preference.matches
        ? []
        : trail.filter((point) => now - point.at < duration);
      const points = trail.map((point) => ({
        ...point,
        strength: Math.pow(1 - (now - point.at) / duration, 1.5),
      }));
      if (active) points.push({ x, y, at: now, strength: 1 });
      if (!points.length) return;
      // Merge the light field with max strength: overlapping passes never thicken the grid.
      const field = new Map<
        string,
        { x: number; y: number; strength: number }
      >();
      const radius = 72;
      points.forEach((point) => {
        for (
          let column = Math.ceil((point.x - radius) / 44);
          column <= Math.floor((point.x + radius) / 44);
          column++
        ) {
          for (
            let row = Math.ceil((point.y - radius) / 44);
            row <= Math.floor((point.y + radius) / 44);
            row++
          ) {
            const gx = column * 44,
              gy = row * 44;
            const distance = Math.hypot(gx - point.x, gy - point.y);
            if (distance > radius) continue;
            const strength =
              point.strength * Math.pow(1 - distance / radius, 0.8);
            const key = `${gx}:${gy}`;
            if (strength > (field.get(key)?.strength ?? 0))
              field.set(key, { x: gx, y: gy, strength });
          }
        }
      });
      const dark = document.documentElement.classList.contains("dark");
      const ink = dark ? "125,211,252" : "8,145,178";
      const intensity = dark ? 0.25 : 0.24;
      ctx.lineWidth = 0.65;
      const edge = (x1: number, y1: number, x2: number, y2: number) => {
        const start = field.get(`${x1}:${y1}`)?.strength ?? 0;
        const end = field.get(`${x2}:${y2}`)?.strength ?? 0;
        if (Math.max(start, end) < 0.012) return;
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, `rgba(${ink},${start * intensity})`);
        gradient.addColorStop(1, `rgba(${ink},${end * intensity})`);
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      };
      field.forEach((point) => {
        edge(point.x, point.y, point.x + 44, point.y);
        edge(point.x, point.y, point.x, point.y + 44);
        if (!field.has(`${point.x - 44}:${point.y}`))
          edge(point.x - 44, point.y, point.x, point.y);
        if (!field.has(`${point.x}:${point.y - 44}`))
          edge(point.x, point.y - 44, point.x, point.y);
      });
      if (trail.length && !preference.matches)
        frame = requestAnimationFrame(tick);
    };
    const tick = (now: number) => {
      frame = 0;
      if (now - previous >= 32) paint(now);
      else frame = requestAnimationFrame(tick);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || document.hidden) return;
      const bounds = element.getBoundingClientRect();
      x = event.clientX - bounds.left;
      y = event.clientY - bounds.top;
      active = true;
      if (element.parentElement?.dataset.fallback === "true") {
        addRegionMovement(
          fallbackRegions,
          fallbackPrevious,
          { x, y },
          width,
          height,
          performance.now(),
        );
        fallbackPrevious = { x, y };
        const strongest = [...fallbackRegions.values()].sort(
          (a, b) => b.energy - a.energy,
        )[0];
        if (strongest) {
          element.parentElement.style.setProperty(
            "--aura-cursor-x",
            `${strongest.x * width}px`,
          );
          element.parentElement.style.setProperty(
            "--aura-cursor-y",
            `${strongest.y * height}px`,
          );
          element.parentElement.style.setProperty(
            "--aura-cursor-open",
            String(
              Math.max(0, Math.min(0.34, (strongest.energy - 0.15) * 0.45)),
            ),
          );
        }
      }
      const now = performance.now(),
        last = trail[trail.length - 1];
      if (!preference.matches) {
        if (!last || Math.hypot(x - last.x, y - last.y) >= 8)
          trail.push({ x, y, at: now });
        else last.at = now;
        if (trail.length > 100) trail.splice(0, trail.length - 100);
      }
      cancelAnimationFrame(frame);
      paint(now);
    };
    const leave = () => {
      element.parentElement?.style.setProperty("--aura-cursor-open", "0");
      fallbackPrevious = null;
      if (preference.matches) {
        clear();
        return;
      }
      if (active) trail.push({ x, y, at: performance.now() });
      active = false;
      cancelAnimationFrame(frame);
      paint(performance.now());
    };
    const visibility = () => {
      if (document.hidden) clear();
    };
    const preferenceChanged = () => {
      cancelAnimationFrame(frame);
      trail = [];
      if (active) paint(performance.now());
      else clear();
    };
    const resize = () => {
      const bounds = element.getBoundingClientRect();
      const nextRatio = Math.min(devicePixelRatio || 1, 1.5);
      if (
        width === bounds.width &&
        height === bounds.height &&
        ratio === nextRatio
      )
        return;
      width = bounds.width;
      height = bounds.height;
      ratio = nextRatio;
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      clear();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    surface.addEventListener("pointermove", move);
    surface.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", visibility);
    preference.addEventListener("change", preferenceChanged);
    return () => {
      clear();
      observer.disconnect();
      surface.removeEventListener("pointermove", move);
      surface.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
      preference.removeEventListener("change", preferenceChanged);
    };
  }, []);
  return (
    <canvas
      ref={canvas}
      className="home-aura-cursor-nodes"
      aria-hidden="true"
    />
  );
}
