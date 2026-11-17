"""Dibujos de Sidney Paget de Commons → public/paget/<id>.webp + src/datos/imagenes.json.

Solo dominio público (se comprueba LicenseShortName). Miniaturas en tamaños estándar de Wikimedia
(250/330/500/960): los originales y los tamaños a medida devuelven 429.
"""
from __future__ import annotations

import io
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

from PIL import Image

from comun import UA, get_json

RAIZ = Path(__file__).resolve().parent.parent
PUBLICO = RAIZ / "public" / "paget"
CRUDO = RAIZ / "datos-crudos" / "img"
SALIDA = RAIZ / "src" / "datos" / "imagenes.json"
TAMS = (250, 330, 500, 960)

# id: (fichero en Commons, ancho máximo)
FICHEROS = {
    "spec-01": ("Spec-01.jpg", 500),
    "spec-04": ("Spec-04.jpg", 500),
    "spec-06": ("Spec-06.jpg", 500),
    "spec-08": ("Spec-08.jpg", 500),
    "spec-09": ("Spec-09.jpg", 500),
    "retrato": ("Sherlock Holmes Portrait Paget.jpg", 500),
    "silver": ("The Adventure of Silver Blaze 01.jpg", 960),
}


def descargar(url: str, destino: Path) -> bytes:
    if destino.exists():
        return destino.read_bytes()
    for k in range(10):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60) as r:
                datos = r.read()
            destino.write_bytes(datos)
            time.sleep(3)
            return datos
        except Exception as e:  # noqa: BLE001
            ra = getattr(e, "headers", None) and e.headers.get("Retry-After")
            espera = int(ra) if ra and ra.isdigit() else 45 * (k + 1)
            print(f"  {destino.name}: {e!r}, espero {espera}s", flush=True)
            time.sleep(espera)
    raise RuntimeError(url)


def main() -> None:
    PUBLICO.mkdir(parents=True, exist_ok=True)
    CRUDO.mkdir(parents=True, exist_ok=True)
    salida = {}
    for id_, (fichero, maximo) in FICHEROS.items():
        d = get_json({"action": "query", "format": "json", "titles": "File:" + fichero, "prop": "imageinfo",
                      "iiprop": "size|url|extmetadata", "iiextmetadatafilter": "LicenseShortName|ImageDescription"}, pausa=3)
        ii = list(d["query"]["pages"].values())[0]["imageinfo"][0]
        em = ii["extmetadata"]
        licencia = em.get("LicenseShortName", {}).get("value", "")
        assert "public domain" in licencia.lower(), (fichero, licencia)
        ok = [t for t in TAMS if t <= min(ii["width"], maximo)] or [TAMS[0]]
        t = ok[-1]
        d2 = get_json({"action": "query", "format": "json", "titles": "File:" + fichero, "prop": "imageinfo", "iiprop": "url", "iiurlwidth": t}, pausa=3)
        url = list(d2["query"]["pages"].values())[0]["imageinfo"][0]["thumburl"]
        datos = descargar(url, CRUDO / f"{id_}-{t}.jpg")
        im = Image.open(io.BytesIO(datos)).convert("RGB")
        im.save(PUBLICO / f"{id_}.webp", "WEBP", quality=82, method=6)
        desc = re.sub(r"<[^>]+>", "", em.get("ImageDescription", {}).get("value", ""))
        pie = re.search(r"[Oo]riginal caption was \"?([^\"]+)\"?", desc)
        salida[id_] = {"fichero": fichero, "pagina": ii["descriptionurl"], "licencia": licencia, "w": im.width, "h": im.height,
                       "pie": pie.group(1).strip().rstrip(".") if pie else ""}
        print("ok", id_, t, im.size, flush=True)
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(salida, ensure_ascii=False, indent=1))
    print(len(salida), file=sys.stderr)


if __name__ == "__main__":
    main()
