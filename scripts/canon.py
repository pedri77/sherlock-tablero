"""Parte los 9 libros de Gutenberg en los 60 casos del canon y cuenta palabras y frases.

Entrada: datos-crudos/textos/<ebook>.txt (espejo gutenberg.pglaf.org; gutenberg.org daba 503).
Salida: src/datos/canon.json con, por caso, año, libro, narrador, palabras y recuentos; y los
totales de las frases que «todo el mundo sabe» que dice Holmes. Solo se guardan cifras y frases
cortas de contexto, no los textos.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
TEXTOS = RAIZ / "datos-crudos" / "textos"
SALIDA = RAIZ / "src" / "datos" / "canon.json"

# (id, título original, título en español, ebook, regex de la cabecera en el cuerpo, año de 1.ª publicación, narrador)
# Narrador: W = Watson, H = Holmes, T = tercera persona.
CASOS = [
    ("stud", "A Study in Scarlet", "Estudio en escarlata", "244", r"^CHAPTER I\.\s*$", 1887, "W"),
    ("sign", "The Sign of the Four", "El signo de los cuatro", "2097", r"^Chapter I\s*$", 1890, "W"),
    ("scan", "A Scandal in Bohemia", "Escándalo en Bohemia", "1661", r"^I\. A SCANDAL IN BOHEMIA", 1891, "W"),
    ("redh", "The Red-Headed League", "La liga de los pelirrojos", "1661", r"^II\. THE RED-HEADED LEAGUE", 1891, "W"),
    ("iden", "A Case of Identity", "Un caso de identidad", "1661", r"^III\. A CASE OF IDENTITY", 1891, "W"),
    ("bosc", "The Boscombe Valley Mystery", "El misterio del valle de Boscombe", "1661", r"^IV\. THE BOSCOMBE VALLEY MYSTERY", 1891, "W"),
    ("five", "The Five Orange Pips", "Las cinco semillas de naranja", "1661", r"^V\. THE FIVE ORANGE PIPS", 1891, "W"),
    ("twis", "The Man with the Twisted Lip", "El hombre del labio retorcido", "1661", r"^VI\. THE MAN WITH THE TWISTED LIP", 1891, "W"),
    ("blue", "The Blue Carbuncle", "El carbunclo azul", "1661", r"^VII\. THE ADVENTURE OF THE BLUE CARBUNCLE", 1892, "W"),
    ("spec", "The Speckled Band", "La banda de lunares", "1661", r"^VIII\. THE ADVENTURE OF THE SPECKLED BAND", 1892, "W"),
    ("engr", "The Engineer's Thumb", "El pulgar del ingeniero", "1661", r"^IX\. THE ADVENTURE OF THE ENGINEER", 1892, "W"),
    ("nobl", "The Noble Bachelor", "El aristócrata solterón", "1661", r"^X\. THE ADVENTURE OF THE NOBLE BACHELOR", 1892, "W"),
    ("bery", "The Beryl Coronet", "La diadema de berilos", "1661", r"^XI\. THE ADVENTURE OF THE BERYL CORONET", 1892, "W"),
    ("copp", "The Copper Beeches", "Las hayas cobrizas", "1661", r"^XII\. THE ADVENTURE OF THE COPPER BEECHES", 1892, "W"),
    ("silv", "Silver Blaze", "Estrella de plata", "834", r"^I\. Silver Blaze", 1892, "W"),
    ("card", "The Cardboard Box", "La caja de cartón", "834", r"^II\. The Adventure of the Cardboard Box", 1893, "W"),
    ("yell", "The Yellow Face", "La cara amarilla", "834", r"^III\. The Yellow Face", 1893, "W"),
    ("stoc", "The Stockbroker's Clerk", "El oficinista del corredor de bolsa", "834", r"^IV\. The Stockbroker", 1893, "W"),
    ("glor", "The Gloria Scott", "El Gloria Scott", "834", r"^V\. The “_Gloria Scott_”", 1893, "W"),
    ("musg", "The Musgrave Ritual", "El ritual de los Musgrave", "834", r"^VI\. The Musgrave Ritual", 1893, "W"),
    ("reig", "The Reigate Squire", "Los hacendados de Reigate", "834", r"^VII\. The Reigate Squires", 1893, "W"),
    ("croo", "The Crooked Man", "El jorobado", "834", r"^VIII\. The Crooked Man", 1893, "W"),
    ("resi", "The Resident Patient", "El paciente interno", "834", r"^IX\. The Resident Patient", 1893, "W"),
    ("gree", "The Greek Interpreter", "El intérprete griego", "834", r"^X\. The Greek Interpreter", 1893, "W"),
    ("nava", "The Naval Treaty", "El tratado naval", "834", r"^XI\. The Naval Treaty", 1893, "W"),
    ("fina", "The Final Problem", "El problema final", "834", r"^XII\. The Final Problem", 1893, "W"),
    ("houn", "The Hound of the Baskervilles", "El sabueso de los Baskerville", "2852", r"^Chapter 1\.\s*$", 1901, "W"),
    ("empt", "The Empty House", "La casa vacía", "108", r"^THE ADVENTURE OF THE EMPTY HOUSE", 1903, "W"),
    ("norw", "The Norwood Builder", "El constructor de Norwood", "108", r"^THE ADVENTURE OF THE NORWOOD BUILDER", 1903, "W"),
    ("danc", "The Dancing Men", "Los bailarines", "108", r"^THE ADVENTURE OF THE DANCING MEN", 1903, "W"),
    ("soli", "The Solitary Cyclist", "La ciclista solitaria", "108", r"^THE ADVENTURE OF THE SOLITARY CYCLIST", 1903, "W"),
    ("prio", "The Priory School", "El colegio Priory", "108", r"^THE ADVENTURE OF THE PRIORY SCHOOL", 1904, "W"),
    ("blac", "Black Peter", "Peter el Negro", "108", r"^THE ADVENTURE OF BLACK PETER", 1904, "W"),
    ("chas", "Charles Augustus Milverton", "Charles Augustus Milverton", "108", r"^THE ADVENTURE OF CHARLES AUGUSTUS MILVERTON", 1904, "W"),
    ("sixn", "The Six Napoleons", "Los seis Napoleones", "108", r"^THE ADVENTURE OF THE SIX NAPOLEONS", 1904, "W"),
    ("3stu", "The Three Students", "Los tres estudiantes", "108", r"^THE ADVENTURE OF THE THREE STUDENTS", 1904, "W"),
    ("gold", "The Golden Pince-Nez", "Los quevedos de oro", "108", r"^THE ADVENTURE OF THE GOLDEN PINCE-NEZ", 1904, "W"),
    ("miss", "The Missing Three-Quarter", "El tres cuartos desaparecido", "108", r"^THE ADVENTURE OF THE MISSING THREE-QUARTER", 1904, "W"),
    ("abbe", "The Abbey Grange", "La granja Abbey", "108", r"^THE ADVENTURE OF THE ABBEY GRANGE", 1904, "W"),
    ("seco", "The Second Stain", "La segunda mancha", "108", r"^THE ADVENTURE OF THE SECOND STAIN", 1904, "W"),
    ("wist", "Wisteria Lodge", "Wisteria Lodge", "2350", r"^The Adventure of Wisteria Lodge\s*$", 1908, "W"),
    ("bruc", "The Bruce-Partington Plans", "Los planos del Bruce-Partington", "2350", r"^The Adventure of the Bruce-Partington Plans\s*$", 1908, "W"),
    ("devi", "The Devil's Foot", "El pie del diablo", "2350", r"^The Adventure of the Devil’s Foot\s*$", 1910, "W"),
    ("redc", "The Red Circle", "El círculo rojo", "2350", r"^The Adventure of the Red Circle\s*$", 1911, "W"),
    ("lady", "Lady Frances Carfax", "La desaparición de lady Frances Carfax", "2350", r"^The Disappearance of Lady Frances Carfax\s*$", 1911, "W"),
    ("dyin", "The Dying Detective", "El detective moribundo", "2350", r"^The Adventure of the Dying Detective\s*$", 1913, "W"),
    ("vall", "The Valley of Fear", "El valle del miedo", "3289", r"^Chapter I\s*$", 1914, "W"),
    ("last", "His Last Bow", "Su último saludo", "2350", r"^His Last Bow: The War Service of Sherlock Holmes\s*$", 1917, "T"),
    ("maza", "The Mazarin Stone", "La piedra de Mazarino", "69700", r"^THE ADVENTURE OF THE MAZARIN STONE", 1921, "T"),
    ("thor", "Thor Bridge", "El problema del puente de Thor", "69700", r"^THE PROBLEM OF THOR BRIDGE", 1922, "W"),
    ("cree", "The Creeping Man", "El hombre que trepaba", "69700", r"^THE ADVENTURE OF THE CREEPING MAN", 1923, "W"),
    ("suss", "The Sussex Vampire", "El vampiro de Sussex", "69700", r"^THE ADVENTURE OF THE SUSSEX VAMPIRE", 1924, "W"),
    ("3gar", "The Three Garridebs", "Los tres Garrideb", "69700", r"^THE ADVENTURE OF THE THREE GARRIDEBS", 1924, "W"),
    ("illu", "The Illustrious Client", "El cliente ilustre", "69700", r"^THE ADVENTURE OF THE ILLUSTRIOUS CLIENT", 1924, "W"),
    ("3gab", "The Three Gables", "Los tres gabletes", "69700", r"^THE ADVENTURE OF THE THREE GABLES", 1926, "W"),
    ("blan", "The Blanched Soldier", "El soldado de la piel decolorada", "69700", r"^THE ADVENTURE OF THE BLANCHED SOLDIER", 1926, "H"),
    ("lion", "The Lion's Mane", "La melena del león", "69700", r"^THE ADVENTURE OF THE LION'S MANE", 1926, "H"),
    ("reti", "The Retired Colourman", "El fabricante de colores retirado", "69700", r"^THE ADVENTURE OF THE RETIRED COLOURMAN", 1926, "W"),
    ("veil", "The Veiled Lodger", "La inquilina del velo", "69700", r"^THE ADVENTURE OF THE VEILED LODGER", 1927, "W"),
    ("shos", "Shoscombe Old Place", "Shoscombe Old Place", "69700", r"^THE ADVENTURE OF SHOSCOMBE OLD PLACE", 1927, "W"),
]

LIBRO = {"244": "Estudio en escarlata", "2097": "El signo de los cuatro", "1661": "Las aventuras", "834": "Las memorias",
         "2852": "El sabueso de los Baskerville", "108": "El regreso", "3289": "El valle del miedo", "2350": "Su último saludo",
         "69700": "El archivo"}
FIN = {"69700": r"^\s+THE ADVENTURES OF SHERLOCK HOLMES\.\s*$"}  # anuncios al final del archivo

FRASES = {
    "elementalQuerido": r"elementary,?\s+my\s+dear\s+watson",
    "elemental": r"\belementary\b",
    "queridoWatson": r"\bmy\s+dear\s+watson\b",
    "watson": r"\bwatson\b",
    "deerstalker": r"\bdeer-?stalker",
    "pipa": r"\bpipe\b",
    "lupa": r"\blens\b|magnifying",
    "violin": r"\bviolin\b",
    "cocaina": r"\bcocaine\b",
    "deduccion": r"\bdeduc",
    "imposible": r"eliminated the impossible|when you have excluded the impossible",
}


def lineas(eb: str) -> list[str]:
    t = (TEXTOS / f"{eb}.txt").read_text(encoding="utf-8")
    t = t.split("*** START OF", 1)[-1]
    t = t.split("*** END OF", 1)[0]
    return t.splitlines()


def main() -> None:
    cache: dict[str, list[str]] = {}
    inicios: list[tuple[str, int]] = []
    for c in CASOS:
        ls = cache.setdefault(c[3], lineas(c[3]))
        rx = re.compile(c[4])
        hits = [i for i, l in enumerate(ls) if rx.search(l) and not l[:1].isspace()]
        assert hits, f"sin cabecera: {c[0]}"
        inicios.append((c[3], hits[0]))  # el índice va sangrado; la cabecera del cuerpo no
    salida = []
    totales = {k: 0 for k in FRASES}
    contextos: dict[str, list[dict]] = {"elemental": []}  # solo se enseñan estas 8
    total_palabras = 0
    for k, c in enumerate(CASOS):
        eb, ini = inicios[k]
        ls = cache[eb]
        sig = [i for e, i in inicios if e == eb and i > ini]
        fin = min(sig) if sig else len(ls)
        if eb in FIN:
            fx = re.compile(FIN[eb])
            fines = [i for i, l in enumerate(ls) if fx.search(l) and i > ini]
            if fines and not sig:
                fin = fines[0]
        texto = "\n".join(ls[ini:fin])
        plano = re.sub(r"\s+", " ", texto.replace("_", ""))
        palabras = len(re.findall(r"[A-Za-z’']+", plano))
        total_palabras += palabras
        cuenta = {f: len(re.findall(rx, plano, re.I)) for f, rx in FRASES.items()}
        for f in totales:
            totales[f] += cuenta[f]
        for f in contextos:
            for m in re.finditer(FRASES[f], plano, re.I):
                a, b = max(0, m.start() - 70), min(len(plano), m.end() + 70)
                contextos[f].append({"caso": c[0], "antes": plano[a:m.start()], "frase": m.group(0), "despues": plano[m.end():b]})
        salida.append({"id": c[0], "titulo": c[1], "es": c[2], "libro": LIBRO[eb], "anio": c[5], "narrador": c[6], "palabras": palabras,
                       "cuenta": {f: cuenta[f] for f in ("elemental", "queridoWatson", "watson", "pipa")}})
        print(f"{c[0]} {c[5]} {palabras:6d} {plano[:60]!r}")
    datos = {"casos": salida, "palabras": total_palabras, "totales": totales, "contextos": contextos}
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(datos, ensure_ascii=False, indent=1))
    print(len(salida), total_palabras, totales)


if __name__ == "__main__":
    main()
