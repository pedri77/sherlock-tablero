import {useEffect, useRef} from 'react';
import {CANON, casos, miles, type Caso} from '../content';
import {progresoFijado, tramo} from '../lib/math';
import {enCadaFotograma} from '../lib/scroll';

/**
 * El archivo: los 60 casos como fichas apiladas por año de publicación, en una tira horizontal de 1887
 * a 1927 que avanza con el scroll. Entre 1894 y 1900 no hay fichas: Holmes estaba «muerto».
 *
 * Guion de scroll (p), sección de 640 svh:
 *   0.02 – 0.97  la tira se desplaza de su inicio a su final (translateX lineal, el lector manda)
 *   el año grande de la cabecera es el de la columna que pasa por el centro de la pantalla
 */

const POR_COLUMNA = 5;
const MAX = Math.max(...CANON.casos.map((c) => c.palabras));
const ANIOS = Array.from({length: 1927 - 1887 + 1}, (_, i) => 1887 + i);
const MUERTE = [1894, 1900];
type Bloque = {tipo: 'anio'; anio: number; casos: Caso[]} | {tipo: 'vacio'; anio: number} | {tipo: 'muerte'};
const BLOQUES: Bloque[] = [];
for (const anio of ANIOS) {
  if (anio === MUERTE[0]) BLOQUES.push({tipo: 'muerte'});
  if (anio >= MUERTE[0] && anio <= MUERTE[1]) continue;
  const lista = CANON.casos.filter((c) => c.anio === anio);
  BLOQUES.push(lista.length ? {tipo: 'anio', anio, casos: lista} : {tipo: 'vacio', anio});
}

function Ficha({c}: {c: Caso}) {
  const nota = casos.notas[c.id];
  return (
    <li className={`ficha relative w-[10.5rem] px-2.5 pt-[34px] pb-2 shadow-[0_4px_10px_oklch(20%_0.02_60/0.18)] md:w-[12rem] ${nota ? 'outline-2 outline-hilo' : ''}`} style={{backgroundPosition: '0 -20px, 0 28px'}}>
      <p className="absolute top-1.5 right-2 left-2.5 truncate font-mono text-[0.625rem] text-tinta-3 uppercase">{c.libro}</p>
      <p className="font-display text-[0.875rem] leading-tight font-bold md:text-[0.9375rem]">{c.es}</p>
      <p className="truncate text-[0.6875rem] text-tinta-3 italic" lang="en">
        {c.titulo}
      </p>
      <div className="mt-1.5 flex items-center gap-1.5">
        <span className="h-1.5 bg-tinta" style={{width: `${Math.max(4, (c.palabras / MAX) * 100)}%`}} />
        <span className="shrink-0 font-mono text-[0.625rem] text-tinta-2">{miles(c.palabras)}</span>
      </div>
      {c.narrador !== 'W' && <p className="mt-1 font-mono text-[0.625rem] text-hilo uppercase">{casos.narrador[c.narrador]}</p>}
      {nota && <p className="mt-1 text-[0.6875rem] leading-snug text-hilo italic">{nota}</p>}
    </li>
  );
}

export function Archivo() {
  const raizRef = useRef<HTMLElement>(null);
  const tiraRef = useRef<HTMLDivElement>(null);
  const anioRef = useRef<HTMLParagraphElement>(null);
  const bloqueRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let pAnterior = -1;
    let anchoAnterior = 0;
    let anioAnterior = '';
    return enCadaFotograma(() => {
      const raiz = raizRef.current;
      const tira = tiraRef.current;
      if (!raiz || !tira) return;
      const {p, visible} = progresoFijado(raiz);
      const vw = window.innerWidth;
      if (!visible || (Math.abs(p - pAnterior) < 0.00004 && vw === anchoAnterior)) return;
      pAnterior = p;
      anchoAnterior = vw;
      const recorrido = Math.max(0, tira.scrollWidth - vw);
      const x = -recorrido * tramo(p, 0.02, 0.97);
      tira.style.transform = `translate3d(${x}px, 0, 0)`;
      // Año de la columna que cruza el centro.
      const centro = vw / 2 - x;
      let texto = '1887';
      bloqueRefs.current.forEach((el, i) => {
        if (!el) return;
        if (el.offsetLeft <= centro) {
          const b = BLOQUES[i];
          texto = b.tipo === 'muerte' ? '1894-1900' : String(b.anio);
        }
      });
      if (texto !== anioAnterior) {
        anioAnterior = texto;
        anioRef.current!.textContent = texto;
      }
    });
  }, []);

  return (
    <section ref={raizRef} id="archivo" aria-labelledby="archivo-titulo" className="relative" style={{height: '640svh'}}>
      <div className="grano sticky top-0 flex h-pantalla flex-col overflow-hidden bg-papel-2">
        <header className="flex items-end justify-between gap-4 px-4 pt-[4svh] sm:px-6 md:px-[6vw] md:pt-[6svh]">
          <div className="max-w-[44rem]">
            <p className="etiqueta text-hilo">{casos.antetitulo}</p>
            <h2 id="archivo-titulo" className="mt-1 font-display text-[clamp(1.75rem,3.6vw,3.25rem)] leading-none font-bold">
              {casos.titulo}
            </h2>
            <p className="mt-2 hidden text-body text-tinta-2 md:block">{casos.cuerpo}</p>
          </div>
          <p ref={anioRef} className="shrink-0 font-display text-[clamp(2.25rem,6vw,5.5rem)] leading-none font-black text-hilo tabular-nums" aria-hidden="true">
            1887
          </p>
        </header>
        <div className="relative mt-4 min-h-0 flex-1 md:mt-6">
          <div ref={tiraRef} className="absolute inset-y-0 left-0 flex items-stretch gap-0 pr-[40vw] pl-4 will-change-transform sm:pl-6 md:pl-[6vw]">
            {BLOQUES.map((b, i) => (
              <div
                key={b.tipo === 'muerte' ? 'muerte' : b.anio}
                ref={(el) => {
                  bloqueRefs.current[i] = el;
                }}
                className="relative flex shrink-0 flex-col border-l border-tinta/25 pb-6"
              >
                {b.tipo === 'anio' && (
                  <>
                    <p className="px-2 font-display text-[1.125rem] leading-none font-bold">{b.anio}</p>
                    <div className="mt-2 flex gap-2 px-2">
                      {Array.from({length: Math.ceil(b.casos.length / POR_COLUMNA)}, (_, k) => (
                        <ul key={k} className="flex flex-col gap-2">
                          {b.casos.slice(k * POR_COLUMNA, (k + 1) * POR_COLUMNA).map((c) => (
                            <Ficha key={c.id} c={c} />
                          ))}
                        </ul>
                      ))}
                    </div>
                  </>
                )}
                {b.tipo === 'vacio' && <p className="w-9 px-1 font-sans text-[0.6875rem] text-tinta-3 [writing-mode:vertical-rl]">{b.anio}</p>}
                {b.tipo === 'muerte' && (
                  <div className="flex h-full flex-none flex-col justify-center bg-tinta px-6 text-papel" style={{width: 'min(78vw, 26rem)'}}>
                    <p className="font-mono text-[0.8125rem] text-papel/70">1894 – 1900</p>
                    <p className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] leading-none font-black">{casos.muerte.titulo}</p>
                    <p className="mt-3 text-body text-papel/85">{casos.muerte.texto}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <p className="px-4 pb-[2svh] text-[0.8125rem] leading-snug text-tinta-2 sm:px-6 md:hidden">{casos.cuerpo}</p>
      </div>
    </section>
  );
}
