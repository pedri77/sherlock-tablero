import {useEffect, useRef} from 'react';
import {IMAGENES, imagenUrl, paget} from '../content';
import {easeInOutSine, lerp, progresoFijado, tramo} from '../lib/math';
import {enCadaFotograma} from '../lib/scroll';

/**
 * La gorra la puso Sidney Paget: al lado, lo que escribió Doyle; encima del dibujo de «Estrella de plata»,
 * una lupa que recorre la escena y termina sobre la gorra de cazador.
 *
 * Guion de scroll (p), sección de 380 svh. Paradas de la lupa en coordenadas del dibujo (0–1):
 *   0.05 – 0.12  aparece la lupa sobre el bombín de Watson (0.18, 0.21), aumento 1,8
 *   0.15 – 0.40  viaja a las manos de Holmes, que dibuja el caso (0.47, 0.49)
 *   0.45 – 0.70  sube a la gorra de Holmes (0.61, 0.23); el aumento crece a 2,6
 *   0.72 – 0.82  se marca la gorra con un círculo rojo y aparece su rótulo
 */

const PARADAS = [
  {x: 0.18, y: 0.21, z: 1.8},
  {x: 0.47, y: 0.49, z: 2},
  {x: 0.61, y: 0.23, z: 2.6},
];

export function Paget() {
  const raizRef = useRef<HTMLElement>(null);
  const figRef = useRef<HTMLDivElement>(null);
  const lupaRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const marcaRef = useRef<HTMLDivElement>(null);
  const citaRefs = useRef<(HTMLElement | null)[]>([]);
  const im = IMAGENES.silver;

  useEffect(() => {
    let pAnterior = -1;
    return enCadaFotograma(() => {
      const raiz = raizRef.current;
      const fig = figRef.current;
      if (!raiz || !fig) return;
      const {p, visible} = progresoFijado(raiz);
      if (!visible || Math.abs(p - pAnterior) < 0.00004) return;
      pAnterior = p;
      const a = easeInOutSine(tramo(p, 0.15, 0.4));
      const b = easeInOutSine(tramo(p, 0.45, 0.7));
      const x = lerp(lerp(PARADAS[0].x, PARADAS[1].x, a), PARADAS[2].x, b);
      const y = lerp(lerp(PARADAS[0].y, PARADAS[1].y, a), PARADAS[2].y, b);
      const z = lerp(lerp(PARADAS[0].z, PARADAS[1].z, a), PARADAS[2].z, b);
      const fw = fig.clientWidth;
      const fh = fig.clientHeight;
      const d = Math.min(fw * 0.34, 260);
      const lupa = lupaRef.current!;
      lupa.style.width = lupa.style.height = `${d}px`;
      lupa.style.transform = `translate3d(${x * fw - d / 2}px, ${y * fh - d / 2}px, 0)`;
      lupa.style.opacity = String(tramo(p, 0.05, 0.12));
      // Dentro de la lupa, el mismo dibujo aumentado z veces y centrado en (x, y).
      const zoom = zoomRef.current!;
      zoom.style.width = `${fw * z}px`;
      zoom.style.height = `${fh * z}px`;
      zoom.style.transform = `translate3d(${d / 2 - x * fw * z}px, ${d / 2 - y * fh * z}px, 0)`;
      const m = tramo(p, 0.72, 0.82);
      marcaRef.current!.style.opacity = String(m);
      citaRefs.current.forEach((el, i) => {
        if (!el) return;
        const o = tramo(p, 0.02 + i * 0.12, 0.1 + i * 0.12);
        el.style.opacity = String(o);
        el.style.transform = `translate3d(0, ${(1 - o) * 14}px, 0)`;
      });
    });
  }, []);

  return (
    <section ref={raizRef} id="paget" aria-labelledby="paget-titulo" className="relative" style={{height: '380svh'}}>
      <div className="grano sticky top-0 flex h-pantalla flex-col gap-4 overflow-hidden bg-papel px-4 pt-[5svh] pb-[3svh] sm:px-6 md:flex-row md:items-center md:gap-[4vw] md:px-[6vw] md:py-0">
        <div className="md:w-[33vw] md:shrink-0">
          <p className="etiqueta text-hilo">{paget.antetitulo}</p>
          <h2 id="paget-titulo" className="mt-2 font-display text-[clamp(1.875rem,3.8vw,3.5rem)] leading-[1] font-bold">
            {paget.titulo}
          </h2>
          <p className="mt-3 hidden text-body text-tinta-2 md:block">{paget.cuerpo}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 md:mt-7 md:grid-cols-1 md:gap-5">
            {paget.citas.map((c, i) => (
              <blockquote
                key={c.original}
                ref={(el) => {
                  citaRefs.current[i] = el;
                }}
                className="border-l-4 border-hilo pl-3 md:pl-4"
                style={{opacity: 0}}
              >
                <p className="font-mono text-[0.8125rem] text-tinta md:text-[1rem]" lang="en">
                  «{c.original}»
                </p>
                <p className="mt-1 text-[0.8125rem] text-tinta-2 italic md:text-[0.9375rem]">{c.es}</p>
                <p className="mt-1 text-[0.6875rem] tracking-wider text-tinta-3 uppercase md:text-[0.75rem]">{c.caso}</p>
              </blockquote>
            ))}
          </div>
        </div>

        <figure className="flex min-h-0 flex-1 flex-col items-center justify-center">
          <div ref={figRef} className="relative w-full max-w-[min(100%,calc(70svh*1.33))] border border-tinta/30 bg-ficha p-0 shadow-[0_14px_40px_oklch(20%_0.02_60/0.3)]" role="img" aria-label={paget.etiqueta}>
            <img src={imagenUrl('silver')} alt="" width={im?.w} height={im?.h} className="block w-full" decoding="async" loading="lazy" />
            <div ref={lupaRef} className="pointer-events-none absolute top-0 left-0 overflow-hidden rounded-full border-[6px] border-marco shadow-[0_10px_30px_oklch(15%_0.02_50/0.55),inset_0_0_20px_oklch(15%_0.02_50/0.35)]" style={{opacity: 0}} aria-hidden="true">
              <div ref={zoomRef} className="absolute top-0 left-0">
                <img src={imagenUrl('silver')} alt="" className="block h-full w-full" decoding="async" />
              </div>
              <div ref={marcaRef} className="absolute inset-[18%] rounded-full border-[3px] border-hilo" style={{opacity: 0}} />
            </div>
          </div>
          <figcaption className="mt-3 max-w-[60ch] text-center text-[0.75rem] text-tinta-2 italic md:text-[0.8125rem]">{paget.pie}</figcaption>
        </figure>
        <p className="text-[0.875rem] leading-snug text-tinta-2 md:hidden">{paget.cuerpo}</p>
      </div>
    </section>
  );
}
