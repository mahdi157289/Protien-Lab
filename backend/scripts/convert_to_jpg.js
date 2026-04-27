const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const logosDir = path.join(__dirname, '../temp_logos');

async function convertToJpg() {
    if (!fs.existsSync(logosDir)) {
        console.error('Directory temp_logos not found');
        return;
    }

    const files = fs.readdirSync(logosDir);

    for (const file of files) {
        const filePath = path.join(logosDir, file);
        const ext = path.extname(file).toLowerCase();
        const basename = path.basename(file, ext);
        const outputPath = path.join(logosDir, `${basename}.jpg`);

        if (ext === '.jpg' || ext === '.jpeg') {
            console.log(`Skipping ${file} (already JPG)`);
            continue;
        }

        try {
            console.log(`Converting ${file} to JPG...`);
            
            // sharp pipeline
            const image = sharp(filePath);
            
            // If it's an SVG or PNG with transparency, we need a background
            // JPG doesn't support alpha channel, so we flatten it onto white
            await image
                .flatten({ background: { r: 255, g: 255, b: 255 } })
                .jpeg({ quality: 90 })
                .toFile(outputPath);

            console.log(`Created ${basename}.jpg`);

            // Verify the new file exists before deleting the old one
            if (fs.existsSync(outputPath)) {
                fs.unlinkSync(filePath);
                console.log(`Deleted original ${file}`);
            }
        } catch (err) {
            console.error(`Failed to convert ${file}:`, err.message);
        }
    }
    console.log('Conversion complete.');
}

convertToJpg();
