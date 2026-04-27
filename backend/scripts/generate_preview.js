const fs = require('fs');
const path = require('path');

const logosDir = path.join(__dirname, '../temp_logos');
const outputFile = path.join(__dirname, '../brand_logos_preview.html');

if (!fs.existsSync(logosDir)) {
    console.error('Directory temp_logos not found');
    process.exit(1);
}

const files = fs.readdirSync(logosDir).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg'));

let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Brand Logos Preview</title>
    <style>
        body { font-family: sans-serif; padding: 20px; background-color: #f0f0f0; }
        .gallery { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }
        .card { 
            background: white; 
            padding: 10px; 
            border-radius: 8px; 
            box-shadow: 0 2px 5px rgba(0,0,0,0.1); 
            text-align: center; 
            width: 200px;
        }
        img { 
            max-width: 100%; 
            height: 150px; 
            object-fit: contain; 
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .name { margin-top: 10px; font-weight: bold; color: #333; }
    </style>
</head>
<body>
    <h1 style="text-align: center;">Brand Logos Preview (${files.length} brands)</h1>
    <div class="gallery">
`;

files.forEach(file => {
    const brandName = path.basename(file, path.extname(file));
    // Path relative to backend/brand_logos_preview.html is ./temp_logos/filename
    htmlContent += `
        <div class="card">
            <img src="./temp_logos/${file}" alt="${brandName}">
            <div class="name">${brandName}</div>
        </div>
    `;
});

htmlContent += `
    </div>
</body>
</html>
`;

fs.writeFileSync(outputFile, htmlContent);
console.log(`Preview file created at: ${outputFile}`);
