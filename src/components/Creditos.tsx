import {IMAGENES, creditos} from '../content';
import {useAjustarTexto} from '../hooks/useAjustarTexto';
import {useAparecer} from '../hooks/useAparecer';
import {irA} from '../lib/scroll';

/** Fuentes, licencia de cada dibujo y la dirección de Baker Street de borde a borde. */
export function Creditos() {
  const ref = useAparecer<HTMLElement>();
  const marca = useAjustarTexto<HTMLSpanElement>();
  return (
    <footer ref={ref} aria-labelledby="creditos-titulo" className="bg-tinta pt-[14svh] text-papel">
      <div className="mx-auto grid max-w-[80rem] gap-10 px-4 sm:px-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:px-[5vw]">
        <div>
          <p data-aparece className="etiqueta text-[oklch(68%_0.17_27)]">
            {creditos.antetitulo}
          </p>
          <h2 id="creditos-titulo" data-aparece style={{'--i': 1} as React.CSSProperties} className="mt-2 font-display text-display font-bold">
            {creditos.titulo}
          </h2>
          <p data-aparece style={{'--i': 2} as React.CSSProperties} className="mt-5 text-body text-papel/80">
            {creditos.cuerpo}
          </p>
          <ul className="mt-6 grid gap-2 text-[0.9375rem]">
            {creditos.fuentes.map((f) => (
              <li key={f.url}>
                <a href={f.url} target="_blank" rel="noreferrer" className="underline decoration-papel/40 underline-offset-4 hover:decoration-papel">
                  {f.texto} ↗
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => irA('#inicio')}
            className="mt-8 border border-papel px-5 py-2.5 font-mono text-[0.875rem] transition-colors hover:bg-papel hover:text-tinta"
          >
            ↑ {creditos.volver}
          </button>
          <p className="mt-8 text-[0.8125rem] text-papel/60">{creditos.firma}</p>
        </div>
        <div data-aparece style={{'--i': 2} as React.CSSProperties}>
          <p className="etiqueta text-papel/60">{creditos.dibujos}</p>
          <ul className="mt-3 grid gap-2 text-[0.875rem] text-papel/80">
            {Object.entries(IMAGENES).map(([id, im]) => (
              <li key={id} className="border-b border-papel/15 pb-2">
                <a href={im.pagina} target="_blank" rel="noreferrer" className="text-papel underline decoration-papel/30 underline-offset-4 hover:decoration-papel">
                  {im.fichero.replace(/\.(jpg|png)$/i, '')}
                </a>
                {im.pie ? ` · «${im.pie}»` : ''}. Sidney Paget. {im.licencia.toLowerCase().includes('public domain') ? 'Dominio público' : im.licencia}.
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-[10svh] overflow-hidden px-4 pb-6 sm:px-6 md:px-[5vw]" aria-hidden="true">
        <span ref={marca} className="inline-block font-display leading-[1.1] font-black whitespace-nowrap text-papel/90">
          {creditos.wordmark}
        </span>
      </div>
    </footer>
  );
}
