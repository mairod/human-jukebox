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
    https.get('https://docs.google.com/spreadsheets/d/e/2PACX-1vRuEkjPdNudyaSRZBU8JbblLdufzq5bOHqGW9818cwj96gdIQaNM-YehW47lgyiZGejtwH_IVjZgMUB/pub?gid=0&single=true&output=csv', (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            console.log("DATA LOADED");
            parseCSV(data)
        });
        
    }).on("error", (err) => {
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
    exec("npm run server", log)
    exec("DISPLAY=:0 chromium-browser --noerrdialogs --kiosk http://localhost:3000 --incognito", log)
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
    fs.writeFile('test.json', json, 'utf8', ()=>{
        console.log("JSON UPDATED")
        runServer()
    });
}