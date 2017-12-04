require('dns').resolve('www.google.com', function (err) {
    if (err) {
        console.log("No connection");
        runServer()
    } else {
        console.log("Connected");
        getData()
    }
});

function getData(){
    const https = require('https');
    https.get('https://docs.google.com/spreadsheets/d/e/2PACX-1vRuEkjPdNudyaSRZBU8JbblLdufzq5bOHqGW9818cwj96gdIQaNM-YehW47lgyiZGejtwH_IVjZgMUB/pub?gid=0&single=true&output=csv', function(resp) {
        let data = '';

        resp.on('data', function(chunk) {
            data += chunk;
        });

        resp.on('end', function() {
            console.log("DATA LOADED");
            parseCSV(data)
        });
        
    }).on("error", function(err) {
        console.log("DATA LOAD ERROR, STARTING SEVER");
        console.log("Error: " + err.message);
        runServer()
    });
}

function parseCSV(data){
    const parse = require('csv-parse')
    parse(data, { comment: '#' }, function (err, output) {
        writeJson(output)
    })
}

function runServer(){
    console.log("LAUNCHING SERVER")
    var exec = require('child_process').exec;
    function log(error, stdout, stderr) { console.log(stdout) }
    
    createServer()

    setTimeout(function(){
        exec("DISPLAY=:0 chromium-browser --noerrdialogs --kiosk http://localhost:3000 --incognito", log)
    }, 5000)
}

function writeJson(input){
    const fs = require('fs')
    let output = []
    let head = input[0]
    for (let i = 1; i < input.length; i++) {
        const line = input[i];
        let tmp = {}
        for (let j = 0; j < line.length; j++) {
            tmp[head[j]] = line[j]
        }
        output.push(tmp)
    }

    let json = JSON.stringify(output);
    fs.writeFile('test.json', json, 'utf8', function(){
        console.log("JSON UPDATED")
        runServer()
    });
}

function createServer(){
    const http = require('http');
    const url = require('url');
    const fs = require('fs');
    const path = require('path');
    const port = process.argv[2] || 3000;

    http.createServer(function (req, res) {
        console.log(`${req.method} ${req.url}`);

        // parse URL
        const parsedUrl = url.parse(req.url);
        // extract URL path
        let pathname = `.${parsedUrl.pathname}`;
        // based on the URL path, extract the file extention. e.g. .js, .doc, ...
        const ext = path.parse(pathname).ext;
        // maps file extention to MIME typere
        const map = {
            '.ico': 'image/x-icon',
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.json': 'application/json',
            '.css': 'text/css',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.wav': 'audio/wav',
            '.mp3': 'audio/mpeg',
            '.svg': 'image/svg+xml',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword'
        };

        fs.exists(pathname, function (exist) {
            if (!exist) {
                // if the file is not found, return 404
                res.statusCode = 404;
                res.end(`File ${pathname} not found!`);
                return;
            }

            // if is a directory search for index file matching the extention
            if (fs.statSync(pathname).isDirectory()) pathname += '/index' + ext;

            // read file from file system
            fs.readFile(pathname, function (err, data) {
                if (err) {
                    res.statusCode = 500;
                    res.end(`Error getting the file: ${err}.`);
                } else {
                    // if the file is found, set Content-type and send data
                    res.setHeader('Content-type', map[ext] || 'text/plain');
                    res.end(data);
                }
            });
        });


    }).listen(parseInt(port));

    console.log(`Server listening on port ${port}`);
}