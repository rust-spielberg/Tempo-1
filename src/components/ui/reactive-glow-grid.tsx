import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type ReactiveGlowGridProps = {
  className?: string;
  colors?: [string, string, string];
};

const VERTEX_SHADER = `
attribute vec2 aPosition;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uTime;
uniform vec3 uColors[3];

void main() {
  vec2 pixel = gl_FragCoord.xy;
  vec2 uv = pixel / uResolution;
  vec2 pointer = uPointer * uResolution;
  float pointerDistance = distance(pixel, pointer);
  float pointerGlow = exp(-pointerDistance / 250.0);

  vec2 grid = abs(fract(pixel / 58.0 - 0.5) - 0.5);
  float lineDistance = min(grid.x, grid.y);
  float lines = 1.0 - smoothstep(0.0, 0.035, lineDistance);
  float diagonal = sin((uv.x + uv.y * 0.72) * 6.28318 + uTime * 0.16);
  float colorMix = clamp(uv.x * 0.78 + uv.y * 0.14 + diagonal * 0.08, 0.0, 1.0);
  vec3 color = colorMix < 0.5
    ? mix(uColors[0], uColors[1], smoothstep(0.0, 0.5, colorMix))
    : mix(uColors[1], uColors[2], smoothstep(0.5, 1.0, colorMix));
  float vignette = 1.0 - smoothstep(0.18, 1.15, length((uv - 0.5) * vec2(1.0, 0.82)));
  float intensity = lines * (0.12 + pointerGlow * 0.9) * vignette;
  float haze = pointerGlow * 0.12 * vignette;

  gl_FragColor = vec4(color * (intensity + haze), intensity + haze);
}
`;

const DEFAULT_COLORS: [string, string, string] = ["#22C55E", "#7DF9FF", "#EF4444"];

function hexToRgb(color: string): [number, number, number] {
  const normalized = color.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => character + character)
          .join("")
      : normalized;
  const number = Number.parseInt(value, 16);

  if (!/^[\da-f]{6}$/i.test(value) || Number.isNaN(number)) {
    return [1, 1, 1];
  }

  return [((number >> 16) & 255) / 255, ((number >> 8) & 255) / 255, (number & 255) / 255];
}

export function ReactiveGlowGrid({ className, colors = DEFAULT_COLORS }: ReactiveGlowGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const colorsRef = useRef(colors);

  useEffect(() => {
    colorsRef.current = colors;
  }, [colors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { alpha: true, antialias: false });
    if (!canvas || !gl) return;

    const compileShader = (type: number, source: string) => {
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

    const vertexShader = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const position = gl.getAttribLocation(program, "aPosition");
    const resolution = gl.getUniformLocation(program, "uResolution");
    const pointerUniform = gl.getUniformLocation(program, "uPointer");
    const time = gl.getUniformLocation(program, "uTime");
    const colorUniform = gl.getUniformLocation(program, "uColors[0]");
    const buffer = gl.createBuffer();
    if (position < 0 || !resolution || !pointerUniform || !time || !colorUniform || !buffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.useProgram(program);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    let frame = 0;
    let width = 0;
    let height = 0;
    const pointer = { x: 0.5, y: 0.5 };
    const start = performance.now();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      pointer.y = 1 - Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    };

    const draw = (now: number) => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform2f(pointerUniform, pointer.x, pointer.y);
      gl.uniform1f(time, (now - start) / 1000);
      gl.uniform3fv(colorUniform, colorsRef.current.flatMap(hexToRgb));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      frame = requestAnimationFrame(draw);
    };

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
    />
  );
}
