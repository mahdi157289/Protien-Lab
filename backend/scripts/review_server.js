const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;
const LOGOS_DIR = path.join(__dirname, '..', 'temp_logos');
const REJECTED_FILE = path.join(__dirname, '..', 'rejected_brands.json');

app.use(cors());
app.use(express.json());
app.use('/logos', express.static(LOGOS_DIR));

app.get('/', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Logo Review</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background: #f5f5f5; }
            h1 { text-align: center; color: #333; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; padding: 20px; }
            .card { background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); text-align: center; transition: all 0.2s; border: 2px solid transparent; }
            .card:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
            .card.rejected { border-color: #ff4444; background: #fff0f0; }
            .card img { max-width: 100%; height: 120px; object-fit: contain; margin-bottom: 10px; }
            .card h3 { margin: 10px 0; font-size: 16px; }
            .actions { margin-top: 10px; }
            label { cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
            input[type="checkbox"] { transform: scale(1.5); }
            .submit-bar { position: fixed; bottom: 0; left: 0; right: 0; background: white; padding: 15px; box-shadow: 0 -2px 10px rgba(0,0,0,0.1); text-align: center; }
            button { background: #007bff; color: white; border: none; padding: 12px 30px; border-radius: 25px; font-size: 16px; cursor: pointer; font-weight: bold; }
            button:hover { background: #0056b3; }
        </style>
    </head>
    <body>
        <h1>Review Brand Logos</h1>
        <p style="text-align: center;">Uncheck the logos that are incorrect or low quality.</p>
        <div class="grid" id="grid"></div>
        <div style="height: 80px;"></div>
        <div class="submit-bar">
            <button onclick="submitReview()">Submit & Retry Unchecked</button>
        </div>

        <script>
            let files = [];

            async function loadImages() {
                const res = await fetch('/api/files');
                files = await res.json();
                const grid = document.getElementById('grid');
                
                files.forEach(file => {
                    const brandName = file.name.replace(/_/g, ' ').replace(/\.[^/.]+$/, "");
                    const div = document.createElement('div');
                    div.className = 'card';
                    div.innerHTML = \`
                        <img src="/logos/\${file.name}" alt="\${brandName}">
                        <h3>\${brandName}</h3>
                        <div class="actions">
                            <label>
                                <input type="checkbox" checked onchange="toggleStatus(this, '\${div.id}')" data-brand="\${brandName}">
                                Valid
                            </label>
                        </div>
                    \`;
                    grid.appendChild(div);
                });
            }

            function toggleStatus(checkbox, id) {
                const card = checkbox.closest('.card');
                if (!checkbox.checked) {
                    card.classList.add('rejected');
                } else {
                    card.classList.remove('rejected');
                }
            }

            async function submitReview() {
                const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                const rejected = [];
                
                checkboxes.forEach(cb => {
                    if (!cb.checked) {
                        rejected.push(cb.getAttribute('data-brand'));
                    }
                });

                if (rejected.length === 0) {
                    if (!confirm('All logos marked as valid. Proceed?')) return;
                }

                try {
                    const res = await fetch('/api/review', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ rejected })
                    });
                    const data = await res.json();
                    if (data.success) {
                        alert('Review saved! You can close this window and return to the chat.');
                    } else {
                        alert('Error saving review.');
                    }
                } catch (e) {
                    alert('Error: ' + e.message);
                }
            }

            loadImages();
        </script>
    </body>
    </html>
    `;
    res.send(html);
});

app.get('/api/files', (req, res) => {
    if (!fs.existsSync(LOGOS_DIR)) return res.json([]);
    const files = fs.readdirSync(LOGOS_DIR).filter(f => /\.(jpg|jpeg|png|svg|webp)$/i.test(f));
    res.json(files.map(f => ({ name: f })));
});

app.post('/api/review', (req, res) => {
    const { rejected } = req.body;
    fs.writeFileSync(REJECTED_FILE, JSON.stringify(rejected, null, 2));
    console.log('Rejected brands saved:', rejected);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Review server running at http://localhost:${PORT}`);
});
