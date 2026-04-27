"""
Background Removal Script for Protein Lab  –  RESUME MODE
===========================================================
This script only processes remaining .jpg files that were NOT yet converted.
- Certification filter fixed: 'iso' removed (it matches product names, not certs)
- Cert keywords kept: gmp, halal, fssc, nsf, informed, cert
- Skips any file already in .png format (already done)
- Backs up originals before processing
- Converts .jpg → .png with transparent background
- Logs all actions to removal_log_resume.txt
"""

import os
import sys
import shutil
import logging
import subprocess
import io
from pathlib import Path
from typing import Optional
from datetime import datetime

# ─── CONFIG ────────────────────────────────────────────────────────────────────
BASE_DIR       = Path(__file__).parent
PRODUCTS_DIR   = BASE_DIR / "backend" / "uploads" / "products"
PHOTOS_DIR     = BASE_DIR / "backend" / "uploads" / "photos"
BACKUP_DIR     = BASE_DIR / "backup_originals"
LOG_FILE       = BASE_DIR / "removal_log_resume.txt"

# Only process these extensions (JPGs that were skipped before)
TARGET_EXTS = {".jpg", ".jpeg"}

# Keywords that identify CERTIFICATION images → skip these
# NOTE: 'iso' is intentionally removed — it matches product names like iso-whey
CERT_KEYWORDS = ["gmp", "halal", "fssc", "nsf", "informed", "cert"]

# ─── LOGGING ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger(__name__)

# ─── HELPERS ───────────────────────────────────────────────────────────────────
def is_certification(filepath: Path) -> bool:
    """Return True if this file looks like a certification badge."""
    name_lower = filepath.name.lower()
    for kw in CERT_KEYWORDS:
        if kw in name_lower:
            return True
    return False


def backup(src: Path) -> Optional[Path]:
    """Copy src to the backup directory, preserving relative structure."""
    try:
        rel = None
        for base in (PRODUCTS_DIR, PHOTOS_DIR):
            try:
                rel = src.relative_to(base)
                rel = Path(base.name) / rel
                break
            except ValueError:
                pass
        dest = BACKUP_DIR / (rel or src.name)
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dest)
        return dest
    except Exception as e:
        log.error("✗ Backup failed for %s: %s", src.name, e)
        return None


def remove_bg(src: Path) -> Optional[bytes]:
    """
    Run rembg in an isolated subprocess to avoid memory leaks / OOM crashes.
    Each call starts a fresh Python process so the ONNX model is reloaded
    cleanly — this is slower but prevents the bad-allocation crashes.
    """
    script = (
        "import sys, io\n"
        "from rembg import remove\n"
        "from PIL import Image\n"
        "data = sys.stdin.buffer.read()\n"
        "result = remove(data)\n"
        "img = Image.open(io.BytesIO(result))\n"
        "img.verify()\n"
        "sys.stdout.buffer.write(result)\n"
    )
    try:
        with open(src, "rb") as f:
            img_bytes = f.read()

        proc = subprocess.run(
            [sys.executable, "-c", script],
            input=img_bytes,
            capture_output=True,
            timeout=120,   # 2 minute timeout per image
        )
        if proc.returncode != 0:
            err = proc.stderr.decode(errors="replace").strip()
            log.error("✗ rembg subprocess failed for %s: %s", src.name, err[-300:])
            return None
        return proc.stdout
    except subprocess.TimeoutExpired:
        log.error("✗ Timeout processing %s", src.name)
        return None
    except Exception as e:
        log.error("✗ rembg error for %s: %s", src.name, e)
        return None


def process_file(fpath: Path, stats: dict):
    """Process a single JPG image."""
    # Skip certification images
    if is_certification(fpath):
        log.info("⏭  SKIP (cert)   %s", fpath.name)
        stats["skipped"] += 1
        return

    log.info("🔄 Processing     %s", fpath.name)

    # 1. Backup original (only if no backup exists yet)
    rel = None
    for base in (PRODUCTS_DIR, PHOTOS_DIR):
        try:
            rel = fpath.relative_to(base)
            rel = Path(base.name) / rel
            break
        except ValueError:
            pass
    backup_dest = BACKUP_DIR / (rel or fpath.name)
    if not backup_dest.exists():
        bk = backup(fpath)
        if bk is None:
            stats["errors"] += 1
            return
    else:
        log.info("   (backup already exists, skipping backup step)")

    # 2. Remove background → PNG bytes
    png_bytes = remove_bg(fpath)
    if png_bytes is None:
        stats["errors"] += 1
        return

    # 3. Determine output path: same name but .png
    out_path = fpath.with_suffix(".png")

    # 4. Write the new PNG
    try:
        out_path.write_bytes(png_bytes)
        # 5. Delete the old .jpg file
        fpath.unlink()
        log.info("✅ Done           %s  →  %s", fpath.name, out_path.name)
        stats["processed"] += 1
    except Exception as e:
        log.error("✗ Write failed for %s: %s", out_path.name, e)
        stats["errors"] += 1


def scan_dir(directory: Path, stats: dict):
    """Walk a directory and process only remaining .jpg/.jpeg files."""
    if not directory.exists():
        log.warning("Directory not found, skipping: %s", directory)
        return

    files = [
        p for p in directory.rglob("*")
        if p.is_file() and p.suffix.lower() in TARGET_EXTS
    ]

    log.info("\n📁 Scanning %s  (%d JPG/JPEG files remaining)\n", directory, len(files))

    for i, fpath in enumerate(files, 1):
        log.info("[%d/%d]", i, len(files))
        process_file(fpath, stats)


# ─── MAIN ──────────────────────────────────────────────────────────────────────
def main():
    log.info("=" * 60)
    log.info("Background Removal – RESUME (JPGs only)  –  %s", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    log.info("Cert keywords: %s", CERT_KEYWORDS)
    log.info("NOTE: 'iso' is NOT excluded — iso-whey etc. are products, not certs")
    log.info("=" * 60)

    # Ensure rembg is installed
    try:
        import rembg  # noqa
        log.info("✅ rembg is installed.")
    except ImportError:
        log.info("📦 rembg not found, installing…")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "rembg[gpu]", "Pillow"])
        log.info("✅ rembg installed successfully.")

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    log.info("💾 Backup folder: %s\n", BACKUP_DIR)

    stats = {"processed": 0, "skipped": 0, "errors": 0}

    # Process products (only remaining JPGs)
    scan_dir(PRODUCTS_DIR, stats)

    log.info("\n" + "=" * 60)
    log.info("✅ DONE")
    log.info("   Processed : %d", stats["processed"])
    log.info("   Skipped   : %d  (certifications)", stats["skipped"])
    log.info("   Errors    : %d", stats["errors"])
    log.info("   Backup at : %s", BACKUP_DIR)
    log.info("=" * 60)
    log.info("Full log saved to: %s", LOG_FILE)


if __name__ == "__main__":
    main()
