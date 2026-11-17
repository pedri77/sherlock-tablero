/** Todo el texto de la página vive aquí. Los componentes no llevan texto suelto. */
import canonDatos from './datos/canon.json';
import imagenesDatos from './datos/imagenes.json';

const base = import.meta.env.BASE_URL;
export type Caso = {id: string; titulo: string; es: string; libro: string; anio: number; narrador: 'W' | 'H' | 'T'; palabras: number; cuenta: Record<string, number>};
export type Contexto = {caso: string; antes: string; frase: string; despues: string};
export const CANON = canonDatos as {casos: Caso[]; palabras: number; totales: Record<string, number>; contextos: Record<string, Contexto[]>};
export type Imagen = {fichero: string; pagina: string; licencia: string; w: number; h: number; pie: string};
export const IMAGENES = imagenesDatos as Record<string, Imagen>;
export const imagenUrl = (id: string) => `${base}paget/${id}.webp`;

/** 1234 → «1.234» */
export const miles = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export type Prueba = {id: string; img: string | null; x: number; y: number; ancho: number; giro: number; titulo: string; texto: string; ficha?: string};

export const portada = {
  antetitulo: 'Sherlock Holmes · 60 casos · 1887-1927',
  titulo: ['El tablero', 'de Baker Street'],
  bajada: 'Un caso de 1892 clavado en el corcho. Desliza y sigue el hilo rojo de prueba en prueba, como Holmes, hasta el culpable.',
  invitacion: 'Desliza para seguir el hilo',
  caso: 'La banda de lunares',
  casoOriginal: 'The Speckled Band · The Strand Magazine, febrero de 1892',
  prueba: (k: number, n: number) => `Prueba ${k} de ${n}`,
  cerrado: 'Caso cerrado',
  etiqueta:
    'Tablero de corcho con las pruebas del caso de La banda de lunares, dibujos de Sidney Paget y fichas escritas a máquina, unidas por un hilo rojo que lleva hasta el culpable',
  /** Coordenadas del centro de cada tarjeta en unidades del tablero (1600 × 1060). */
  pruebas: [
    {
      id: 'helen',
      img: 'spec-01',
      x: 770, y: 210, ancho: 330, giro: -3,
      titulo: 'La clienta',
      texto: 'A las siete y cuarto de la mañana, Helen Stoner llega temblando a Baker Street. Tiene treinta años y el pelo ya gris. Su hermana Julia murió hace dos años en la casa familiar de Stoke Moran, dos semanas antes de casarse.',
    },
    {
      id: 'julia',
      img: null,
      x: 1230, y: 190, ancho: 310, giro: 2.5,
      titulo: 'Las últimas palabras',
      ficha: '«¡Helen! ¡Fue la banda!\n¡La banda de lunares!»',
      texto: 'Julia murió gritando eso, sin una herida y con la puerta y la ventana cerradas por dentro. Las noches anteriores había oído un silbido bajo, de madrugada.',
    },
    {
      id: 'roylott',
      img: 'spec-04',
      x: 1390, y: 560, ancho: 290, giro: 3,
      titulo: 'El padrastro',
      texto: 'El doctor Grimesby Roylott vivió en la India y deja sueltos un guepardo y un babuino por la finca. Se presenta en Baker Street a amenazar a Holmes y dobla el atizador de la chimenea con las manos. Holmes lo endereza en cuanto se va.',
    },
    {
      id: 'motivo',
      img: null,
      x: 1000, y: 540, ancho: 300, giro: -2,
      titulo: 'El motivo',
      ficha: 'Renta de la madre: 750 £ al año.\nCada hija que se case: 250 £.\nHelen acaba de prometerse.',
      texto: 'Holmes va a leer el testamento. Si las dos hijas se casaban, al padrastro le quedaba muy poco. Julia murió antes de su boda. Ahora es Helen la que se va a casar.',
    },
    {
      id: 'cuarto',
      img: 'spec-06',
      x: 590, y: 600, ancho: 340, giro: -2.5,
      titulo: 'El cuarto de Julia',
      texto: 'Holmes encuentra tres cosas raras: un cordón de campanilla que no llama a ninguna campana, un respiradero que da al cuarto del doctor en vez de a la calle y una cama clavada al suelo, justo debajo de los dos.',
    },
    {
      id: 'doctor',
      img: null,
      x: 210, y: 640, ancho: 300, giro: 2,
      titulo: 'El cuarto del doctor',
      ficha: 'Una caja fuerte de hierro.\nUn platillo de leche.\nUna correa de perro atada en lazo.',
      texto: '«No tenemos gato», dice Helen. Pero un guepardo no se conforma con un platillo de leche. Holmes ya sabe qué vive en la caja fuerte.',
    },
    {
      id: 'noche',
      img: 'spec-08',
      x: 420, y: 910, ancho: 320, giro: 1.5,
      titulo: 'La noche en vela',
      texto: 'Holmes y Watson esperan a oscuras en el cuarto de Helen. De madrugada se oye el silbido. Algo baja por el cordón: Holmes lo azota con el bastón y lo hace volver por el respiradero.',
    },
    {
      id: 'culpable',
      img: 'spec-09',
      x: 1070, y: 890, ancho: 380, giro: -1.5,
      titulo: 'El culpable',
      texto: 'Al otro lado, el doctor Roylott está muerto. En la frente lleva la «banda de lunares»: una víbora de pantano, «la serpiente más mortífera de la India», que había enseñado a volver con leche y silbidos. Holmes admite que es «sin duda, responsable indirecto» de su muerte.',
    },
  ] as Prueba[],
};

export const primera = {
  cabecera: 'Gaceta de Baker Street',
  fecha: 'Edición especial · Londres, 1887-1927',
  precio: 'Un penique',
  titular: 'Cuarenta años, sesenta casos y un detective que no quiso morirse',
  entradilla:
    'Arthur Conan Doyle publicó cuatro novelas y cincuenta y seis relatos de Sherlock Holmes. Casi todos los cuenta el doctor Watson, y casi todos salieron en The Strand Magazine.',
  columnas: [
    'Holmes apareció en 1887 en «Estudio en escarlata», una novela que pasó sin mucho ruido. El éxito llegó en 1891, cuando Doyle empezó a publicar relatos en The Strand: cada mes un caso completo con el mismo detective. Era una fórmula nueva y funcionó.',
    'Doyle se cansó pronto. En diciembre de 1893 lo hizo caer por las cataratas de Reichenbach abrazado al profesor Moriarty, en «El problema final». En 1901 publicó «El sabueso de los Baskerville», un caso de antes de la caída, y en 1903 lo resucitó en «La casa vacía». Siguió escribiéndolo hasta 1927.',
    'Doyle murió en 1930: en España su obra es de dominio público desde 2011, y en Estados Unidos los últimos relatos lo son desde 2023. Sidney Paget, su dibujante, murió en 1908. Las citas de esta página son traducciones propias.',
  ],
  cifras: [
    {clave: 'casos', texto: 'casos: 4 novelas y 56 relatos'},
    {clave: 'palabras', texto: 'palabras en los textos originales en inglés'},
    {clave: 'watson', texto: 'casos los cuenta Watson; Holmes narra 2 y otros 2 van en tercera persona'},
  ],
  pie: 'Sherlock Holmes según Sidney Paget, The Strand Magazine, 1904.',
};

export const frase = {
  antetitulo: 'Lo que Holmes nunca dijo',
  titulo: 'Busquemos la frase más famosa',
  cuerpo:
    'Si hay una frase que todo el mundo pone en boca de Holmes, es «Elementary, my dear Watson», «Elemental, querido Watson». La buscamos en los 60 casos.',
  busqueda: 'Elementary, my dear Watson',
  buscando: 'Revisando',
  resultado: (palabras: string) => `0 resultados en ${palabras} palabras`,
  ninguna: 'No está. Ni una vez.',
  partes: [
    {busqueda: 'elementary', clave: 'elemental', texto: 'veces escribe «elementary», casi nunca hablando con Watson.'},
    {busqueda: 'my dear Watson', clave: 'queridoWatson', texto: 'veces dice «my dear Watson», pero nunca detrás de «elementary».'},
  ],
  cerca: 'Lo más cerca que llega, en «El jorobado» (1893):',
  citaCerca: ['—¡Excelente! —exclamé.', '—Elemental —dijo él.'],
  origen:
    'La frase completa sale en periódicos desde 1909, y una parodia de 1901 ya decía «Elementary, my dear Potson». Se suele atribuir al actor William Gillette, que interpretó a Holmes en el teatro unas 1.300 veces y que también le dio la pipa curva.',
  objetos: [
    {clave: 'deerstalker', texto: 'veces sale la palabra «deerstalker», la gorra de cazador'},
    {clave: 'pipa', texto: 'veces sale «pipe»: la pipa sí es suya'},
  ],
  etiqueta: 'Buscador que recorre los 60 casos buscando la frase «Elementary, my dear Watson» y no la encuentra',
};

export const paget = {
  antetitulo: 'El dibujante',
  titulo: 'La gorra la puso Sidney Paget',
  cuerpo:
    'Doyle nunca escribió la palabra «deerstalker». Paget, que dibujó a Holmes para The Strand entre 1891 y 1904, convirtió estas dos gorras de viaje en una gorra de cazador con dos viseras. Desde entonces, Holmes no se la ha quitado.',
  citas: [
    {original: 'close-fitting cloth cap', es: 'una gorra de paño ajustada', caso: 'El misterio del valle de Boscombe, 1891'},
    {original: 'ear-flapped travelling-cap', es: 'su gorra de viaje con orejeras', caso: 'Estrella de plata, 1892'},
  ],
  pie: 'Holmes explica el caso a Watson en el tren. Dibujo original de Sidney Paget para «Estrella de plata», The Strand Magazine, diciembre de 1892.',
  etiqueta: 'Dibujo de Sidney Paget de Holmes y Watson en un compartimento de tren; una lupa recorre la escena hasta la gorra de Holmes',
};

export const casos = {
  antetitulo: 'El archivo',
  titulo: 'Los 60 casos, año a año',
  cuerpo:
    'Cada ficha es un caso, en el año en que se publicó por primera vez. La barra mide su longitud. Desliza para recorrer cuarenta años de archivo.',
  narrador: {W: 'Lo cuenta Watson', H: 'Lo cuenta Holmes', T: 'En tercera persona'} as Record<string, string>,
  palabras: 'palabras',
  muerte: {titulo: 'Holmes ha muerto', texto: 'Diciembre de 1893: Doyle lo tira por las cataratas de Reichenbach. Ocho años sin un caso nuevo.'},
  notas: {
    houn: 'Vuelve en 1901, con un caso de antes de morir.',
    empt: 'Estaba vivo: lo cuenta «La casa vacía».',
    blan: 'Por fin, Holmes cuenta un caso él mismo.',
    shos: 'Último caso. Doyle se despide: «esto tiene que acabar».',
  } as Record<string, string>,
  etiqueta: 'Línea de tiempo de 1887 a 1927 con los 60 casos de Sherlock Holmes como fichas apiladas por año',
};

export const creditos = {
  antetitulo: 'Fuentes',
  titulo: 'Cómo está hecha',
  cuerpo:
    'Textos: las nueve ediciones de Project Gutenberg, partidas en los 60 casos con un script; solo se guardan las cifras y frases cortas de contexto. Dibujos: Sidney Paget en The Strand Magazine, dominio público, escaneos de Wikimedia Commons. Las traducciones son propias.',
  fuentes: [
    {texto: 'Conan Doyle en Project Gutenberg', url: 'https://www.gutenberg.org/ebooks/author/69'},
    {texto: 'Dibujos de Paget en Commons', url: 'https://commons.wikimedia.org/wiki/Category:Illustrations_from_books_of_Sherlock_Holmes_by_Sidney_Paget'},
    {texto: 'Playfair Display SC, Old Standard TT y Special Elite', url: 'https://fonts.google.com/'},
  ],
  dibujos: 'Dibujos de Sidney Paget',
  volver: 'Volver al tablero',
  wordmark: '221B Baker Street',
  firma: 'Textos y código hechos con IA (Claude) y revisados, como pieza de portfolio. Las imágenes no se han generado ni modificado con IA.',
};
