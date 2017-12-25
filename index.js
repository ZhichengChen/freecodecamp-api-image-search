var express = require('express');
var app = express();
var moment = require('moment');
const cheerio = require('cheerio');
var latest = [];

app.get('/api/imagesearch/:word', function(req, res, next) {
    var page = req.query.offset;
    const https = require('https');
    var word = req.params.word;
    if (page == undefined) {
        page = 1;
    }
    https.get('https://www.google.com/search?q='+word+'&tbm=isch', (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        latest.push({
            "term": word,
            "when": new Date()
        });
        resp.on('end', () => {
            var result = [];
            const $ = cheerio.load(data);
            var i = 0;
            $('.images_table').find('tr').each(function(i, elem) {
              $(this).find('td').each(function(j, td){
                  if (++i < page*5 && i > (page -1) *5) {
                    result.push({
                      "url":$(this).find('img').attr('src'),
                      "snippet":$(this).html().split('<br>')[2].replace(/\<.+\>/g, ''),
                      "thumbnail":$(this).find('img').attr('src'),
                      "context":$(this).find('a').attr('href').replace(/\/url\?q=/, '')});
                  }
              });
            });
            res.json(result);
        });
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
    
});

app.get('/api/latest/imagesearch/', function(req, res, next) {
    res.json(latest);
});

app.listen(process.env.PORT || 5000, function(){
   console.log('Running.'); 
});