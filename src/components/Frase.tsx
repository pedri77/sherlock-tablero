import {useEffect, useRef} from 'react';
import {CANON, frase, miles} from '../content';
import {easeOutCubic, progresoFijado, tramo} from '../lib/math';
import {enCadaFotograma} from '../lib/scroll';

/**
 * Lo que Holmes nunca dijo: un buscador a máquina recorre los 60 casos buscando «Elementary, my dear
 * Watson» y no la encuentra. Luego cuenta las dos mitades por separado y explica de dónde salió la frase.
 *
 * Guion de scroll (p), sección de 440 svh. Cuatro fichas que se relevan en el mismo sitio:
 *   0.03 – 0.13  se escribe la búsqueda letra a letra
 *   0.15 – 0.34  la barra recorre los 60 casos (el nombre del caso cambia con el scroll)
 *   0.34 – 0.40  sale el 0 y «No está»                                    ficha 1: 0.00 – 0.44
 *   0.46 – 0.60  «elementary»: el contador sube a 8 y aparecen sus 8 frases  ficha 2: 0.44 – 0.63
 *   0.64 – 0.72  «my dear Watson»: el contador sube a 92 y la cita de «El jorobado»  ficha 3: 0.63 – 0.77
 *   0.78 – 0.90  de dónde sale la frase, y la gorra y la pipa contadas       ficha 4: 0.77 – 1
 */

const CASOS = CANON.casos;
const ELEM = CANON.contextos.elemental;
const VENTANAS: [number, number][] = [
  [0, 0.44],
  [0.44, 0.63],
  [0.63, 0.77],
  [0.77, 1.01],
];
const nombreCaso = (id: string) => CASOS.find((c) => c.id === id)?.es ?? id;

export function Frase() {
  const raizRef = useRef<HTMLElement>(null);
  const escritoRef = useRef<HTMLSpanElement>(null);
  const barraRef = useRef<HTMLDivElement>(null);
  const casoRef = useRef<HTMLSpanElement>(null);
  const cuentaRef = useRef<HTMLSpanElement>(null);
  const ceroRef = useRef<HTMLDivElement>(null);
  const fichaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const lineaRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    let pAnterior = -1;
    return enCadaFotograma(() => {
      const raiz = raizRef.current;
      if (!raiz) return;
      const {p, visible} = progresoFijado(raiz);
      if (!visible || Math.abs(p - pAnterior) < 0.00004) return;
      pAnterior = p;
      const letras = Math.round(frase.busqueda.length * tramo(p, 0.03, 0.13));
      escritoRef.current!.textContent = frase.busqueda.slice(0, letras);
      const r = tramo(p, 0.15, 0.34);
      barraRef.current!.style.transform = `scaleX(${r})`;
      const i = Math.min(CASOS.length - 1, Math.floor(r * CASOS.length));
      casoRef.current!.textContent = r > 0 ? CASOS[i].es : '';
      cuentaRef.current!.textContent = `${r > 0 ? i + 1 : 0}/${CASOS.length}`;
      const cero = easeOutCubic(tramo(p, 0.34, 0.4));
      ceroRef.current!.style.opacity = String(cero);
      ceroRef.current!.style.transform = `translate3d(0, ${(1 - cero) * 16}px, 0)`;

      VENTANAS.forEach(([a, b], k) => {
        const el = fichaRefs.current[k];
        if (!el) return;
        const entra = k === 0 ? 1 : tramo(p, a, a + 0.02);
        const o = Math.min(entra, 1 - tramo(p, b - 0.02, b));
        el.style.opacity = String(o);
        el.style.visibility = o > 0.01 ? 'visible' : 'hidden';
      });
      const n1 = Math.round(CANON.totales.elemental * tramo(p, 0.46, 0.52));
      const n2 = Math.round(CANON.totales.queridoWatson * tramo(p, 0.64, 0.7));
      if (numRefs.current[0]) numRefs.current[0].textContent = String(n1);
      if (numRefs.current[1]) numRefs.current[1].textContent = String(n2);
      lineaRefs.current.forEach((el, j) => {
        if (!el) return;
        const o = tramo(p, 0.5 + j * 0.012, 0.515 + j * 0.012);
        el.style.opacity = String(o);
        el.style.transform = `translate3d(${(1 - o) * 12}px, 0, 0)`;
      });
    });
  }, []);

  return (
    <section ref={raizRef} id="frase" aria-labelledby="frase-titulo" className="relative" style={{height: '440svh'}}>
      <div className="grano sticky top-0 flex h-pantalla flex-col gap-4 overflow-hidden bg-papel-2 px-4 pt-[5svh] pb-[3svh] sm:px-6 md:flex-row md:items-center md:gap-[5vw] md:px-[6vw] md:py-0">
        <div className="md:w-[34vw] md:shrink-0">
          <p className="etiqueta text-hilo">{frase.antetitulo}</p>
          <h2 id="frase-titulo" className="mt-2 font-display text-[clamp(1.875rem,3.8vw,3.5rem)] leading-[1] font-bold">
            {frase.titulo}
          </h2>
          <p className="mt-3 text-[0.9375rem] leading-snug text-tinta-2 md:mt-5 md:text-body">{frase.cuerpo}</p>
        </div>

        <div className="relative min-h-0 flex-1 md:h-[78svh]" role="region" aria-label={frase.etiqueta}>
          {/* 1. La búsqueda */}
          <div
            ref={(el) => {
              fichaRefs.current[0] = el;
            }}
            className="ficha absolute inset-x-0 top-0 px-5 pt-[52px] pb-6 shadow-[0_10px_30px_oklch(20%_0.02_60/0.25)] md:top-1/2 md:-translate-y-1/2 md:px-8"
          >
            <div className="flex items-center gap-3 border-2 border-tinta bg-papel px-3 py-2 font-mono text-[clamp(1rem,1.8vw,1.5rem)]">
              <span aria-hidden="true">⌕</span>
              <span>
                <span ref={escritoRef} />
                <span className="ml-0.5 inline-block h-[1.1em] w-[0.5ch] translate-y-[0.15em] bg-tinta motion-safe:animate-pulse" />
              </span>
              <span className="sr-only">{frase.busqueda}</span>
            </div>
            <div className="mt-5 flex items-baseline justify-between gap-3 font-mono text-[0.875rem] text-tinta-2">
              <span className="truncate">
                {frase.buscando}: <span ref={casoRef} className="text-tinta" />
              </span>
              <span ref={cuentaRef} className="tabular-nums" />
            </div>
            <div className="mt-2 h-2 bg-tinta/10">
              <div ref={barraRef} className="h-full origin-left bg-tinta" style={{transform: 'scaleX(0)'}} />
            </div>
            <div ref={ceroRef} className="mt-6" style={{opacity: 0}}>
              <p className="font-display text-[clamp(4.5rem,11vw,9rem)] leading-none font-black text-hilo">0</p>
              <p className="mt-1 font-mono text-[0.9375rem]">{frase.resultado(miles(CANON.palabras))}</p>
              <p className="mt-3 font-display text-[clamp(1.5rem,2.6vw,2.25rem)] leading-tight font-bold">{frase.ninguna}</p>
            </div>
          </div>

          {/* 2. «elementary» */}
          <div
            ref={(el) => {
              fichaRefs.current[1] = el;
            }}
            className="ficha absolute inset-x-0 top-0 px-5 pt-[52px] pb-6 shadow-[0_10px_30px_oklch(20%_0.02_60/0.25)] md:top-1/2 md:-translate-y-1/2 md:px-8"
            style={{opacity: 0, visibility: 'hidden'}}
          >
            <p className="font-mono text-[0.9375rem] text-tinta-2">⌕ {frase.partes[0].busqueda}</p>
            <p className="mt-2 flex items-baseline gap-3">
              <span
                ref={(el) => {
                  numRefs.current[0] = el;
                }}
                className="font-display text-[clamp(3.5rem,8vw,6.5rem)] leading-none font-black text-hilo tabular-nums"
              >
                0
              </span>
              <span className="text-[0.9375rem] md:text-body">{frase.partes[0].texto}</span>
            </p>
            <ol className="mt-4 grid gap-1.5 font-mono text-[0.75rem] leading-snug md:text-[0.8125rem]">
              {ELEM.map((c, j) => (
                <li
                  key={j}
                  ref={(el) => {
                    lineaRefs.current[j] = el;
                  }}
                  className={`grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-baseline gap-1 ${c.caso === 'croo' ? 'text-tinta' : 'text-tinta-3'}`}
                  style={{opacity: 0}}
                  title={nombreCaso(c.caso)}
                >
                  <span className="truncate text-right" dir="rtl">
                    <bdi>{c.antes.slice(-48)}</bdi>
                  </span>
                  <mark className={`px-0.5 ${c.caso === 'croo' ? 'bg-hilo text-papel' : 'bg-tinta/10 text-tinta'}`}>{c.frase}</mark>
                  <span className="truncate">{c.despues.slice(0, 48)}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* 3. «my dear Watson» y la cita más cercana */}
          <div
            ref={(el) => {
              fichaRefs.current[2] = el;
            }}
            className="ficha absolute inset-x-0 top-0 px-5 pt-[52px] pb-6 shadow-[0_10px_30px_oklch(20%_0.02_60/0.25)] md:top-1/2 md:-translate-y-1/2 md:px-8"
            style={{opacity: 0, visibility: 'hidden'}}
          >
            <p className="font-mono text-[0.9375rem] text-tinta-2">⌕ {frase.partes[1].busqueda}</p>
            <p className="mt-2 flex items-baseline gap-3">
              <span
                ref={(el) => {
                  numRefs.current[1] = el;
                }}
                className="font-display text-[clamp(3.5rem,8vw,6.5rem)] leading-none font-black text-hilo tabular-nums"
              >
                0
              </span>
              <span className="text-[0.9375rem] md:text-body">{frase.partes[1].texto}</span>
            </p>
            <p className="mt-6 text-[0.9375rem] text-tinta-2 md:text-body">{frase.cerca}</p>
            <blockquote className="mt-3 border-l-4 border-hilo pl-4 font-display text-[clamp(1.375rem,2.4vw,2rem)] leading-snug">
              {frase.citaCerca.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </blockquote>
          </div>

          {/* 4. De dónde sale */}
          <div
            ref={(el) => {
              fichaRefs.current[3] = el;
            }}
            className="ficha absolute inset-x-0 top-0 px-5 pt-[52px] pb-6 shadow-[0_10px_30px_oklch(20%_0.02_60/0.25)] md:top-1/2 md:-translate-y-1/2 md:px-8"
            style={{opacity: 0, visibility: 'hidden'}}
          >
            <p className="text-[0.9375rem] leading-relaxed md:text-body">{frase.origen}</p>
            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-tinta/30 pt-5">
              {frase.objetos.map((o) => (
                <div key={o.clave}>
                  <dt className="sr-only">{o.texto}</dt>
                  <dd>
                    <span className="block font-display text-[clamp(2.75rem,6vw,4.5rem)] leading-none font-black text-hilo tabular-nums">{CANON.totales[o.clave]}</span>
                    <span className="mt-1 block text-[0.875rem] text-tinta-2">{o.texto}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
