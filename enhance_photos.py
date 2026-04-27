"""
Enhance Final Product Photos
==========================================
Applies professional enhancements (Sharpen, Contrast, Color vibrancy) 
to all photos in backend/uploads/products/ to make them look premium.
"""

import os
import shutil
import logging
from pathlib import Path
from PIL import Image, ImageEnhance

BASE_DIR = Path(__file__).parent
PRODUCTS_DIR = BASE_DIR / "backend" / "uploads" / "products"
BACKUP_DIR = BASE_DIR / "backup_before_enhance"

logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger(__name__)

def enhance_image(filepath: Path):
    try:
        # Load image
        img = Image.open(filepath)
        
        # Preserve transparency for PNGs
        has_alpha = img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info)
        
        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGBA' if has_alpha else 'RGB')

        # 1. Enhance Sharpness (Makes text and edges much crisper)
        sharpness_enhancer = ImageEnhance.Sharpness(img)
        img = sharpness_enhancer.enhance(1.4) # 40% sharper

        # 2. Enhance Color Vibrancy (Makes the product colors pop)
        color_enhancer = ImageEnhance.Color(img)
        img = color_enhancer.enhance(1.15) # 15% more vibrant

        # 3. Enhance Contrast (Gives deeper blacks and brighter highlights)
        contrast_enhancer = ImageEnhance.Contrast(img)
        img = contrast_enhancer.enhance(1.08) # 8% more contrast

        # Save back, preserving high quality
        save_format = 'PNG' if filepath.suffix.lower() == '.png' else 'JPEG'
        
        # For JPEG, we can use quality=95. For PNG, quality is ignored but we can optimize.
        if save_format == 'JPEG':
            img.convert('RGB').save(filepath, format='JPEG', quality=95)
        else:
            img.save(filepath, format='PNG')
            
        return True
    except Exception as e:
        log.error(f"✗ Error enhancing {filepath.name}: {e}")
        return False

def main():
    log.info("==========================================")
    log.info("Starting Premium Photo Enhancement...")
    log.info("==========================================")
    
    # 1. Safely create a backup of the current state of images
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    
    files = [p for p in PRODUCTS_DIR.rglob("*") if p.is_file() and p.suffix.lower() in {".jpg", ".jpeg", ".png"}]
    log.info(f"Found {len(files)} finalized images to enhance.\n")

    success = 0
    
    for filepath in files:
        # Backup the current version first before any edits
        try:
            rel = filepath.relative_to(PRODUCTS_DIR)
        except ValueError:
            rel = filepath.name
            
        backup_dest = BACKUP_DIR / rel
        backup_dest.parent.mkdir(parents=True, exist_ok=True)
        
        if not backup_dest.exists():
            shutil.copy2(filepath, backup_dest)
            
        # Perform enhancement
        if enhance_image(filepath):
            success += 1
            if success % 20 == 0 or success == len(files):
                log.info(f"✨ Enhanced {success}/{len(files)} images...")

    log.info("\n==========================================")
    log.info(f"✅ DONE! Successfully enhanced {success} images.")
    log.info(f"💾 A safe backup of the pre-enhanced photos is saved in: {BACKUP_DIR.name}")
    log.info("==========================================")

if __name__ == "__main__":
    main()
