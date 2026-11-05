"use client";

import { useEffect, useRef } from "react";
import type { VideoTrack } from "livekit-client";
import { cn } from "@/lib/utils";

const VERTEX = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = vec2((a_pos.x + 1.0) * 0.5, (1.0 - a_pos.y) * 0.5);
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Contrast-adaptive sharpen: pulls detail back out of the soft edges the
// video encoder leaves behind. Cheap enough to run per tile on integrated GPUs.
const FRAGMENT = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform vec2 u_scale;
uniform vec2 u_offset;
uniform vec2 u_step;
uniform float u_amount;

void main() {
  vec2 uv = v_uv * u_scale + u_offset;
  vec3 c = texture2D(u_tex, uv).rgb;
  vec3 n = texture2D(u_tex, uv + vec2(0.0, -u_step.y)).rgb;
  vec3 s = texture2D(u_tex, uv + vec2(0.0, u_step.y)).rgb;
  vec3 w = texture2D(u_tex, uv + vec2(-u_step.x, 0.0)).rgb;
  vec3 e = texture2D(u_tex, uv + vec2(u_step.x, 0.0)).rgb;
  vec3 blur = (n + s + w + e) * 0.25;
  vec3 sharp = c + (c - blur) * u_amount;
  gl_FragColor = vec4(clamp(sharp, 0.0, 1.0), 1.0);
}`;

const MAX_BUFFER_WIDTH = 960;

/**
 * Renders a LiveKit video track through a small WebGL sharpening pass.
 * Falls back to the plain video element if WebGL is unavailable.
 */
export function SharpVideo({
  track,
  className,
  label,
}: {
  track: VideoTrack;
  className?: string;
  label?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    video.muted = true;
    video.playsInline = true;
    track.attach(video);
    video.play().catch(() => {});

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      desynchronized: true,
      powerPreference: "low-power",
    });

    let raf = 0;
    let frameHandle: number | null = null;
    let stopped = false;
    let cleanupGl: (() => void) | null = null;

    const fallback = () => {
      canvas.style.display = "none";
      video.style.opacity = "1";
    };

    if (!gl) {
      fallback();
    } else {
      try {
        const program = gl.createProgram();
        const vertex = gl.createShader(gl.VERTEX_SHADER);
        const fragment = gl.createShader(gl.FRAGMENT_SHADER);
        if (!program || !vertex || !fragment) throw new Error("gl: program");

        gl.shaderSource(vertex, VERTEX);
        gl.compileShader(vertex);
        gl.shaderSource(fragment, FRAGMENT);
        gl.compileShader(fragment);
        if (!gl.getShaderParameter(vertex, gl.COMPILE_STATUS)) throw new Error("gl: vertex");
        if (!gl.getShaderParameter(fragment, gl.COMPILE_STATUS)) throw new Error("gl: fragment");
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("gl: link");

        const quad = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quad);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
          gl.STATIC_DRAW
        );

        const aPos = gl.getAttribLocation(program, "a_pos");
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.useProgram(program);
        gl.uniform1i(gl.getUniformLocation(program, "u_tex"), 0);
        const uScale = gl.getUniformLocation(program, "u_scale");
        const uOffset = gl.getUniformLocation(program, "u_offset");
        const uStep = gl.getUniformLocation(program, "u_step");
        const uAmount = gl.getUniformLocation(program, "u_amount");

        const resize = () => {
          const rect = canvas.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const width = Math.min(Math.round(rect.width * dpr), MAX_BUFFER_WIDTH);
          const height = Math.round((width / rect.width) * rect.height);
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            gl.viewport(0, 0, width, height);
          }
        };
        const observer = new ResizeObserver(resize);
        observer.observe(canvas);
        resize();

        const render = () => {
          if (stopped) return;
          const width = canvas.width;
          const height = canvas.height;
          if (video.readyState >= 2 && video.videoWidth && video.videoHeight) {
            const videoAspect = video.videoWidth / video.videoHeight;
            const canvasAspect = width / height;
            let sx = 1;
            let sy = 1;
            let ox = 0;
            let oy = 0;
            if (videoAspect > canvasAspect) {
              sx = canvasAspect / videoAspect;
              ox = (1 - sx) / 2;
            } else {
              sy = videoAspect / canvasAspect;
              oy = (1 - sy) / 2;
            }
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
            gl.uniform2f(uScale, sx, sy);
            gl.uniform2f(uOffset, ox, oy);
            gl.uniform2f(uStep, sx / video.videoWidth, sy / video.videoHeight);
            // Sharpen harder on full quality layers, gently on small ones so
            // low bitrate faces do not turn crunchy.
            gl.uniform1f(uAmount, video.videoHeight >= 700 ? 0.8 : 0.5);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
          }
          schedule();
        };

        const schedule = () => {
          if (stopped) return;
          if (typeof video.requestVideoFrameCallback === "function") {
            frameHandle = video.requestVideoFrameCallback(render);
          } else {
            raf = requestAnimationFrame(render);
          }
        };
        schedule();

        cleanupGl = () => {
          observer.disconnect();
          gl.deleteTexture(texture);
          gl.deleteBuffer(quad);
          gl.deleteProgram(program);
          gl.deleteShader(vertex);
          gl.deleteShader(fragment);
        };
      } catch {
        fallback();
      }
    }

    return () => {
      stopped = true;
      if (frameHandle !== null && typeof video.cancelVideoFrameCallback === "function") {
        video.cancelVideoFrameCallback(frameHandle);
      }
      if (raf) cancelAnimationFrame(raf);
      cleanupGl?.();
      try {
        track.detach(video);
      } catch {}
    };
  }, [track]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <video
        ref={videoRef}
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-0"
      />
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
      {label ? <span className="sr-only">{label}</span> : null}
    </div>
  );
}
