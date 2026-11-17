import {CANON, IMAGENES, imagenUrl, miles, primera} from '../content';
import {useAparecer} from '../hooks/useAparecer';

/** Primera plana de un periódico inventado: quién era Holmes, cuántos casos hay y por qué son libres. */
export function PrimeraPlana() {
  const ref = useAparecer<HTMLElement>();
  const watson = CANON.casos.filter((c) => c.narrador === 'W').length;
  const valor: Record<string, string> = {casos: String(CANON.casos.length), palabras: miles(CANON.palabras), watson: String(watson)};
  const retrato = IMAGENES.retrato;
  return (
    <section ref={ref} id="gaceta" aria-labelledby="gaceta-titulo" className="grano bg-papel px-4 py-[12svh] sm:px-6 md:px-[6vw]">
      <div className="mx-auto max-w-[78rem]">
        <header className="text-center">
          <div className="flex items-baseline justify-between border-b border-tinta pb-1 font-sans text-[0.75rem] tracking-widest text-tinta-2 uppercase">
            <span>{primera.fecha}</span>
            <span>{primera.precio}</span>
          </div>
          <p data-aparece className="mt-3 font-display text-[clamp(2rem,6.2vw,6rem)] leading-none font-black tracking-tight">
            {primera.cabecera}
          </p>
          <div className="filete mt-3" />
        </header>

        <h2 id="gaceta-titulo" data-aparece style={{'--i': 1} as React.CSSProperties} className="mx-auto mt-8 max-w-[22ch] text-center font-display text-display font-bold">
          {primera.titular}
        </h2>
        <p data-aparece style={{'--i': 2} as React.CSSProperties} className="mx-auto mt-5 max-w-[60ch] text-center text-lead text-tinta-2 italic">
          {primera.entradilla}
        </p>

        <div className="mt-10 grid gap-8 border-t border-tinta pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.1fr)] md:gap-0 md:divide-x md:divide-tinta/40">
          {primera.columnas.slice(0, 2).map((c, i) => (
            <p key={i} data-aparece style={{'--i': i} as React.CSSProperties} className="text-body text-justify hyphens-auto md:px-6 md:first:pl-0" lang="es">
              {i === 0 && <span className="float-left mt-1 mr-2 font-display text-[3.6rem] leading-[0.8] font-black">{c[0]}</span>}
              {i === 0 ? c.slice(1) : c}
            </p>
          ))}
          <div className="md:pl-6">
            {retrato && (
              <figure data-aparece className="border border-tinta/40 bg-ficha p-2">
                <img src={imagenUrl('retrato')} alt="Retrato de Sherlock Holmes dibujado por Sidney Paget: perfil afilado, pelo peinado hacia atrás" width={retrato.w} height={retrato.h} loading="lazy" decoding="async" className="mx-auto block max-h-[22rem] w-auto grabado" />
                <figcaption className="mt-2 text-center text-[0.8125rem] text-tinta-2 italic">{primera.pie}</figcaption>
              </figure>
            )}
            <p data-aparece style={{'--i': 2} as React.CSSProperties} className="mt-6 text-body text-justify hyphens-auto" lang="es">
              {primera.columnas[2]}
            </p>
          </div>
        </div>

        <dl className="mt-10 grid border-y-4 border-double border-tinta sm:grid-cols-3 sm:divide-x sm:divide-tinta/40">
          {primera.cifras.map((c, i) => (
            <div key={c.clave} data-aparece style={{'--i': i} as React.CSSProperties} className="border-b border-tinta/30 px-2 py-5 text-center last:border-b-0 sm:border-b-0 sm:px-6">
              <dt className="sr-only">{c.texto}</dt>
              <dd>
                <span className="block font-display text-[clamp(2.5rem,5vw,4rem)] leading-none font-black tabular-nums">{valor[c.clave]}</span>
                <span className="mt-2 block text-[0.9375rem] text-tinta-2">{c.texto}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
