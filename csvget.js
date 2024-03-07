const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const app = express();
const results = [];
const itemsPerPage = 30;

// Read CSV file
fs.createReadStream('./LE.txt')
    .pipe(csv({
        headers: ["id", "name", "storage1", "storage2", "storage3", "storage4", "storage5", "storage6", "price", "model", "priceVAT"],
        separator: "\t"
    }))
    .on('data', (data) => {
        for (let element in data) {
            if (data.hasOwnProperty(element)) {
                data[element] = data[element].trim().toLowerCase();
            }
        }
        results.push(data);
    })

// Search function
function search(query) {
    return results.filter(item => item.id.includes(query.toLowerCase()) || item.name.includes(query.toLowerCase()));
}

// Route to serve the index.html page
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// Route to handle search
app.get('/search', function (req, res) {
    const query = req.query.q;
    if (!query) {
        return res.send('No query specified');
    }
    const searchResults = search(query);
    res.send(searchResults);
});

app.get('/spare-parts-all', function (req, res) {
    res.send(results);
});

// Route to get all spare parts with pagination
app.get('/spare-parts', function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;
    const totalPages = Math.ceil(results.length / itemsPerPage);
    const itemsOnPage = results.slice(startIndex, endIndex);

    // Check if there's a next page
    let nextPage = null;
    if (page < totalPages) {
        nextPage = `/spare-parts?page=${page + 1}`;
    }

    // Render the spare-parts page with pagination button
    let html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Spare Parts</title>
        </head>
        <body>
            <h1>Spare Parts</h1>
            <ul>
    `;
    itemsOnPage.forEach(part => {
        html += `<li>${part.name}</li>`;
    });
    html += `
            </ul>
    `;
    if (nextPage) {
        html += `<a href="${nextPage}"><button>Next Page</button></a>`;
    }
    html += `
        </body>
        </html>
    `;
    res.send(html);
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
