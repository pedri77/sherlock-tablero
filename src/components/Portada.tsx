import {useEffect, useRef} from 'react';
import {IMAGENES, imagenUrl, portada, type Prueba} from '../content';
import {easeInOutSine, easeOutCubic, lerp, progresoFijado, tramo} from '../lib/math';
import {enCadaFotograma} from '../lib/scroll';

/**
 * Portada: un tablero de corcho con el caso de La banda de lunares. Una cámara recorre las pruebas
 * en orden y el hilo rojo se tensa de una a otra hasta el culpable; al final se aleja y se ve todo el tablero.
 *
 * Guion de scroll (p), sección de 1000 svh. Tablero de 1600 × 1060 unidades; la cámara es un
 * translate + scale del tablero entero.
 *   0.00 – 0.08  cámara sobre el recorte del titular; el panel enseña el título y la invitación
 *   0.08 + 0.09·(k−1) … 0.08 + 0.09·k  → paso k (1–8):
 *                0–50 % del paso  la cámara viaja de la prueba k−1 a la k (easeInOutSine)
 *                10–60 %          el hilo de k−1 a k se dibuja (stroke-dashoffset 1 → 0)
 *                35–55 %          el panel cambia al texto de la prueba k
 *   0.82 – 0.92  la cámara se aleja hasta ver el tablero completo
 *   0.90 – 0.96  cae el sello «Caso cerrado» sobre el culpable
 */

const W = 1600;
const H = 1060;
const PRUEBAS = portada.pruebas;
const N = PRUEBAS.length;
const INICIO = 0.08;
const PASO = 0.09;
const TITULAR = {x: 290, y: 250, ancho: 470};

const altoTarjeta = (pr: Prueba) => {
  if (!pr.img) return 250;
  const im = IMAGENES[pr.img];
  const prop = im ? im.h / im.w : 0.75;
  return 24 + (pr.ancho - 24) * prop + 46;
};
const ALTOS = PRUEBAS.map(altoTarjeta);
const ALTO_TITULAR = 300;
/** Punto donde se clava la chincheta (y donde se ata el hilo). */
const chincheta = (k: number) => (k < 0 ? {x: TITULAR.x, y: TITULAR.y - ALTO_TITULAR / 2 + 18} : {x: PRUEBAS[k].x, y: PRUEBAS[k].y - ALTOS[k] / 2 + 14});
const hilo = (a: {x: number; y: number}, b: {x: number; y: number}) => {
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  return `M ${a.x} ${a.y} Q ${(a.x + b.x) / 2} ${(a.y + b.y) / 2 + d * 0.14} ${b.x} ${b.y}`;
};
const HILOS = PRUEBAS.map((_, k) => hilo(chincheta(k - 1), chincheta(k)));

export function Portada() {
  const raizRef = useRef<HTMLElement>(null);
  const tableroRef = useRef<HTMLDivElement>(null);
  const hiloRefs = useRef<(SVGPathElement | null)[]>([]);
  const tarjetaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const selloRef = useRef<HTMLDivElement>(null);
  const invitaRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let pAnterior = -1;
    let anchoAnterior = 0;
    return enCadaFotograma(() => {
      const raiz = raizRef.current;
      if (!raiz) return;
      const {p, visible} = progresoFijado(raiz);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (!visible || (Math.abs(p - pAnterior) < 0.00004 && vw === anchoAnterior)) return;
      pAnterior = p;
      anchoAnterior = vw;

      // Zona de pantalla para el tablero: a la derecha del panel en escritorio, arriba en móvil.
      const ancho = vw >= 768;
      const area = ancho ? {x: vw * 0.36, y: 0, w: vw * 0.64, h: vh} : {x: 0, y: 0, w: vw, h: vh * 0.56};
      const cerca = (cx: number, cy: number, anchoTarjeta: number, alto: number) => {
        const s = Math.min(area.w / (anchoTarjeta * 1.9), area.h / (alto * 1.45), 1.35);
        return {cx, cy, s};
      };
      const objetivo = (k: number) => (k < 0 ? cerca(TITULAR.x, TITULAR.y, TITULAR.ancho, ALTO_TITULAR) : cerca(PRUEBAS[k].x, PRUEBAS[k].y, PRUEBAS[k].ancho, ALTOS[k]));
      const todo = {cx: W / 2, cy: H / 2, s: Math.min(area.w / (W * 1.04), area.h / (H * 1.04))};

      const paso = (p - INICIO) / PASO; // 0 antes del paso 1; k dentro del paso k+1
      const k = Math.max(0, Math.min(N - 1, Math.floor(paso)));
      const t = Math.max(0, Math.min(1, paso - k));
      const viaje = p < INICIO ? 0 : easeInOutSine(tramo(t, 0, 0.5));
      const de = objetivo(k - 1);
      const a = objetivo(k);
      let cam = {cx: lerp(de.cx, a.cx, viaje), cy: lerp(de.cy, a.cy, viaje), s: lerp(de.s, a.s, viaje)};
      // Entre pruebas lejanas la cámara se aleja un poco a mitad de camino, como un travelling.
      cam.s *= 1 - 0.18 * Math.sin(Math.PI * viaje);
      const fuera = easeInOutSine(tramo(p, 0.82, 0.92));
      cam = {cx: lerp(cam.cx, todo.cx, fuera), cy: lerp(cam.cy, todo.cy, fuera), s: lerp(cam.s, todo.s, fuera)};
      const tx = area.x + area.w / 2 - cam.cx * cam.s;
      const ty = area.y + area.h / 2 - cam.cy * cam.s;
      tableroRef.current!.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${cam.s})`;

      // Hilos: el k-ésimo se dibuja durante el paso k.
      PRUEBAS.forEach((_, j) => {
        const pj = tramo(p, INICIO + PASO * j + PASO * 0.1, INICIO + PASO * j + PASO * 0.6);
        const el = hiloRefs.current[j];
        if (el) el.style.strokeDashoffset = String(1 - pj);
        const tj = tarjetaRefs.current[j];
        if (tj) {
          const activa = 1 - Math.min(1, Math.abs(paso - 0.5 - j) * 1.4);
          tj.style.boxShadow = `0 ${6 + 10 * activa}px ${14 + 22 * activa}px oklch(15% 0.02 50 / ${0.35 + 0.25 * activa})`;
        }
      });

      // Panel: índice continuo (0 = título; j+1 = prueba j).
      const pos = p < INICIO ? 0 : k + tramo(t, 0.35, 0.55);
      textoRefs.current.forEach((el, i) => {
        if (!el) return;
        const o = Math.max(0, 1 - Math.abs(pos - i) * 2.2);
        el.style.opacity = String(o);
        el.style.visibility = o > 0.01 ? 'visible' : 'hidden';
        el.style.transform = `translate3d(0, ${(i - pos) * 14}px, 0)`;
      });
      invitaRef.current!.style.opacity = String(1 - tramo(p, 0.01, 0.05));

      const sello = easeOutCubic(tramo(p, 0.9, 0.96));
      selloRef.current!.style.opacity = String(sello);
      selloRef.current!.style.transform = `translate(-50%, -50%) rotate(-12deg) scale(${lerp(1.8, 1, sello)})`;
    });
  }, []);

  const culpable = PRUEBAS[N - 1];

  return (
    <section ref={raizRef} id="inicio" aria-labelledby="portada-titulo" className="relative" style={{height: '1000svh'}}>
      <div className="sticky top-0 h-pantalla overflow-hidden bg-marco">
        {/* Tablero */}
        <div className="absolute inset-0" role="img" aria-label={portada.etiqueta}>
          <div ref={tableroRef} className="corcho absolute top-0 left-0 origin-top-left will-change-transform" style={{width: W, height: H, boxShadow: 'inset 0 0 60px oklch(25% 0.04 50 / 0.6), 0 0 0 26px var(--color-marco)'}}>
            {/* Recorte del titular */}
            <div
              className="grano absolute bg-papel px-7 py-6 text-tinta"
              style={{left: TITULAR.x - TITULAR.ancho / 2, top: TITULAR.y - ALTO_TITULAR / 2, width: TITULAR.ancho, height: ALTO_TITULAR, transform: 'rotate(-2deg)', boxShadow: '0 8px 18px oklch(15% 0.02 50 / 0.4)', clipPath: 'polygon(0 2%, 4% 0, 30% 1.5%, 62% 0, 100% 1%, 99% 52%, 100% 100%, 70% 98.5%, 35% 100%, 0 99%, 1% 50%)'}}
            >
              <p className="text-center font-sans text-[13px] tracking-[0.3em] uppercase">{portada.casoOriginal}</p>
              <div className="filete mt-3" />
              <p className="mt-4 text-center font-display text-[64px] leading-[0.95] font-black">{portada.caso}</p>
              <div className="filete mt-5" />
            </div>

            {PRUEBAS.map((pr, j) => (
              <div
                key={pr.id}
                ref={(el) => {
                  tarjetaRefs.current[j] = el;
                }}
                className={`absolute ${pr.img ? 'bg-ficha p-3' : 'ficha px-6 pt-7 pb-5'}`}
                style={{left: pr.x - pr.ancho / 2, top: pr.y - ALTOS[j] / 2, width: pr.ancho, height: ALTOS[j], transform: `rotate(${pr.giro}deg)`}}
              >
                {pr.img ? (
                  <>
                    <img src={imagenUrl(pr.img)} alt="" width={IMAGENES[pr.img]?.w} height={IMAGENES[pr.img]?.h} className="block w-full grabado" decoding="async" />
                    <p className="mt-2 text-center font-sans text-[13px] leading-tight tracking-wide text-tinta-2 uppercase">«{IMAGENES[pr.img]?.pie}»</p>
                  </>
                ) : (
                  <>
                    <p className="font-mono text-[15px] text-hilo uppercase">{pr.titulo}</p>
                    <p className="mt-[14px] font-mono text-[19px] leading-[30px] whitespace-pre-line text-tinta">{pr.ficha}</p>
                  </>
                )}
              </div>
            ))}

            {/* Hilos y chinchetas, por encima de las tarjetas */}
            <svg className="pointer-events-none absolute inset-0" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
              <defs>
                <filter id="sombra-hilo" x="-5%" y="-5%" width="110%" height="120%">
                  <feDropShadow dx="0" dy="4" stdDeviation="2.5" floodColor="oklch(15% 0.02 50)" floodOpacity="0.45" />
                </filter>
              </defs>
              {HILOS.map((d, j) => (
                <path
                  key={j}
                  ref={(el) => {
                    hiloRefs.current[j] = el;
                  }}
                  d={d}
                  pathLength={1}
                  fill="none"
                  stroke="var(--color-hilo)"
                  strokeWidth={3.2}
                  strokeLinecap="round"
                  filter="url(#sombra-hilo)"
                  style={{strokeDasharray: 1, strokeDashoffset: 1}}
                />
              ))}
              {[-1, ...PRUEBAS.map((_, j) => j)].map((j) => {
                const c = chincheta(j);
                return (
                  <g key={j}>
                    <circle cx={c.x + 2} cy={c.y + 4} r={10} fill="oklch(15% 0.02 50 / 0.35)" />
                    <circle cx={c.x} cy={c.y} r={10} fill="oklch(52% 0.18 27)" />
                    <circle cx={c.x - 3} cy={c.y - 3} r={3.5} fill="oklch(80% 0.08 30)" />
                  </g>
                );
              })}
            </svg>

            <div
              ref={selloRef}
              className="pointer-events-none absolute border-[6px] border-hilo px-5 py-2 font-display text-[54px] leading-none font-black tracking-wider whitespace-nowrap text-hilo uppercase mix-blend-multiply"
              style={{left: culpable.x + 40, top: culpable.y + 70, opacity: 0, transform: 'translate(-50%, -50%) rotate(-12deg)'}}
              aria-hidden="true"
            >
              {portada.cerrado}
            </div>
          </div>
        </div>

        {/* Panel de texto */}
        <div className="grano absolute inset-x-0 bottom-0 h-[44svh] border-t-4 border-double border-tinta bg-papel px-4 pt-4 sm:px-6 md:inset-y-0 md:right-auto md:left-0 md:h-auto md:w-[36vw] md:border-t-0 md:border-r-4 md:px-[3vw] md:pt-0">
          <div className="relative h-full">
            <div
              ref={(el) => {
                textoRefs.current[0] = el;
              }}
              className="absolute inset-x-0 top-0 md:top-1/2 md:-translate-y-1/2"
            >
              <p className="etiqueta text-hilo">{portada.antetitulo}</p>
              <h1 id="portada-titulo" className="mt-2 font-display text-[clamp(2.25rem,5vw,4.75rem)] leading-[0.95] font-black">
                {portada.titulo[0]}
                <br />
                {portada.titulo[1]}
              </h1>
              <p className="mt-3 text-[0.9375rem] leading-snug text-tinta-2 md:mt-5 md:text-lead">{portada.bajada}</p>
              <p ref={invitaRef} className="mt-4 font-mono text-[0.8125rem] text-hilo md:mt-8">
                {portada.invitacion} ↓
              </p>
            </div>
            {PRUEBAS.map((pr, j) => (
              <div
                key={pr.id}
                ref={(el) => {
                  textoRefs.current[j + 1] = el;
                }}
                className="absolute inset-x-0 top-0 md:top-1/2 md:-translate-y-1/2"
                style={{opacity: 0, visibility: 'hidden'}}
              >
                <p className="font-mono text-[0.8125rem] text-hilo">{portada.prueba(j + 1, N)}</p>
                <h2 className="mt-1 font-display text-[clamp(1.625rem,3vw,2.75rem)] leading-none font-bold">{pr.titulo}</h2>
                <p className="mt-3 text-[0.9375rem] leading-snug md:mt-4 md:text-lead">{pr.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
