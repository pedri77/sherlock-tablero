import {useEffect} from 'react';
import {Archivo} from './components/Archivo';
import {Creditos} from './components/Creditos';
import {Frase} from './components/Frase';
import {Paget} from './components/Paget';
import {Portada} from './components/Portada';
import {PrimeraPlana} from './components/PrimeraPlana';
import {useMovimientoReducido} from './hooks/useMovimientoReducido';
import {iniciarScroll} from './lib/scroll';

/** Orden del guion: tablero de La banda de lunares · primera plana · la frase que nunca dijo · la gorra de Paget · los 60 casos · fuentes. */
export default function App() {
  const reducido = useMovimientoReducido();
  useEffect(() => iniciarScroll(reducido), [reducido]);
  return (
    <main>
      <Portada />
      <PrimeraPlana />
      <Frase />
      <Paget />
      <Archivo />
      <Creditos />
    </main>
  );
}
