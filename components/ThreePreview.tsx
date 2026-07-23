import { useEffect, useRef, useState } from 'react';
import type { PreviewAnimationType } from '../animationConfig';

interface ThreePreviewProps {
  activeAnimation: PreviewAnimationType;
  easing: (progress: number) => number;
  progressRef: React.MutableRefObject<{ progress: number }>;
  range: number;
}

interface LivePreviewOptions {
  activeAnimation: PreviewAnimationType;
  easing: (progress: number) => number;
  range: number;
}

const clampProgress = (progress: number): number => Math.min(1, Math.max(0, progress));

export const ThreePreview: React.FC<ThreePreviewProps> = ({
  activeAnimation,
  easing,
  progressRef,
  range,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<LivePreviewOptions>({ activeAnimation, easing, range });
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  optionsRef.current = { activeAnimation, easing, range };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let cleanup = () => {};

    const setup = async () => {
      try {
        const {
          AmbientLight,
          BoxGeometry,
          Color,
          DirectionalLight,
          Mesh,
          MeshStandardMaterial,
          PerspectiveCamera,
          Scene,
          WebGLRenderer,
        } = await import('three');

        if (disposed) return;

        const renderer = new WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.domElement.className = 'absolute inset-0 h-full w-full';
        renderer.domElement.setAttribute('aria-hidden', 'true');
        container.append(renderer.domElement);

        const scene = new Scene();
        const camera = new PerspectiveCamera(42, 1, 0.1, 100);
        camera.position.z = 5;

        const geometry = new BoxGeometry(0.55, 0.55, 0.55);
        const material = new MeshStandardMaterial({
          color: new Color('#6366f1'),
          roughness: 0.38,
          metalness: 0.08,
        });
        const meshes = [0, 1, 2].map(() => {
          const mesh = new Mesh(geometry, material);
          scene.add(mesh);
          return mesh;
        });

        scene.add(new AmbientLight(0xffffff, 1.45));
        const keyLight = new DirectionalLight(0xffffff, 2.4);
        keyLight.position.set(2, 3, 4);
        scene.add(keyLight);

        const updateAccent = () => {
          const accent = getComputedStyle(document.documentElement)
            .getPropertyValue('--accent-primary')
            .trim();
          if (accent) material.color.set(accent);
        };

        const resize = () => {
          const width = Math.max(1, container.clientWidth);
          const height = Math.max(1, container.clientHeight);
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        };

        const render = () => {
          const rawProgress = clampProgress(progressRef.current.progress);
          const current = optionsRef.current;

          meshes.forEach((mesh, index) => {
            const staggerProgress = clampProgress(rawProgress * 1.2 - index * 0.1);
            const localProgress =
              current.activeAnimation === 'Stagger' ? staggerProgress : rawProgress;
            const easedProgress = current.easing(localProgress);

            mesh.visible = current.activeAnimation === 'Stagger' || index === 0;
            mesh.position.set(0, 0, 0);
            mesh.rotation.set(0.35, 0.55, 0);
            mesh.scale.setScalar(1);

            switch (current.activeAnimation) {
              case 'Move':
                mesh.position.x = (easedProgress - 0.5) * 3.2 * current.range;
                break;
              case 'Scale':
                mesh.scale.setScalar(0.7 + easedProgress * 0.65 * current.range);
                break;
              case 'Rotate':
                mesh.rotation.z = easedProgress * Math.PI * current.range;
                mesh.rotation.y = 0.55 + easedProgress * Math.PI * current.range;
                break;
              case 'Stagger':
                mesh.position.x = (easedProgress - 0.5) * 2.8 * current.range;
                mesh.position.y = 0.7 - index * 0.7;
                break;
            }
          });

          renderer.render(scene, camera);
        };

        let visible = true;
        const updateLoop = () => renderer.setAnimationLoop(visible ? render : null);
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);

        const intersectionObserver = new IntersectionObserver(([entry]) => {
          visible = entry?.isIntersecting ?? true;
          updateLoop();
        });
        intersectionObserver.observe(container);

        const themeObserver = new MutationObserver(updateAccent);
        themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class', 'style'],
        });

        updateAccent();
        resize();
        updateLoop();
        setStatus('ready');

        cleanup = () => {
          renderer.setAnimationLoop(null);
          resizeObserver.disconnect();
          intersectionObserver.disconnect();
          themeObserver.disconnect();
          geometry.dispose();
          material.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch (error) {
        console.error('Three.js preview failed to initialize.', error);
        if (!disposed) setStatus('error');
      }
    };

    void setup();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [progressRef]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Three.js easing preview"
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      data-testid="three-preview"
    >
      {status === 'loading' && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
          Loading WebGL…
        </span>
      )}
      {status === 'error' && (
        <span role="alert" className="max-w-52 text-center text-xs text-text-secondary">
          Three.js could not start WebGL. Choose another engine.
        </span>
      )}
    </div>
  );
};
