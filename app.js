/*jshint node: true */
var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    io = require('socket.io'),
    oceny = [],
    sockety = [],
    status = {},
    wyniki = [];


var compare = function(a,b) {
  'use strict';
        if (a.wynik < b.wynik){ return 1; }
        if (a.wynik > b.wynik){ return -1; }
        if(a.note < b.note){ return 1; }
        if(a.note > b.note){ return -1; }

  return 0;
};



    var server = http.createServer(function (req, res) {
    'use strict';
    var filePath = '.' + req.url,
        contentType = 'text/html',
        extName;

    console.log('request starting...' + filePath);
        if (filePath === './') {
        filePath = './index.html';
    }
    extName = path.extname(filePath);
    switch (extName) {
    case '.js':
        contentType = 'text/javascript';
        break;
    case '.css':
        contentType = 'text/css';
        break;
  }
    path.exists(filePath, function(exists) {
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    res.writeHead(500);
                    res.end();
                } else {
                    res.writeHead(200, {
                        'Content-Type': contentType
                    });
                    res.end(content, 'utf-8');
                }
            });
        } else {
            res.writeHead(404);
            res.end();
        }
    });
});

var socket = io.listen(server);


 status = {
              sedzia1       : 'sedzia1',
              sedzia2       : 'sedzia2',
              sedzia3       : 'sedzia3',
              sedzia4       : 'sedzia4',
              sedzia5       : 'sedzia5',
              sedzia1pass   : 'sedzia1',
              sedzia2pass   : 'sedzia2',
              sedzia3pass   : 'sedzia3',
              sedzia4pass   : 'sedzia4',
              sedzia5pass   : 'sedzia5',
              sedzia1ok     :  false,
              sedzia2ok     :  false,
              sedzia3ok     :  false,
              sedzia4ok     :  false,
              sedzia5ok     :  false,
              zawodnik1     : 'zawodnik1',
              zawodnik2     : 'zawodnik2',
              zawodnik3     : 'zawodnik3',
              zawodnikAkt   : null
              
                  };



socket.on('connection', function (client) {
      'use strict';
      console.log('Client connected...');

        sockety[client.id] = client;



      client.emit('updatePlayers', status);
        client.on('join', function (username, password) {
        // ustawianie nazwy użytkownika/połączenia
         
                if (status.sedzia1 == username && status.sedzia1pass === password && status.sedzia1ok === false) {
                 client.set('username', username);
                 status.sedzia1ok = true;
                 client.emit('updatePlayers', status);
              }
                else if (status.sedzia2 == username && status.sedzia2pass === password && status.sedzia2ok === false) {
                client.set('username', username);
                status.sedzia2ok = true;
                client.emit('updatePlayers', status);
              }
                else if(status.sedzia3 == username && status.sedzia3pass === password && status.sedzia3ok === false) {
                  client.set('username', username);
                  status.sedzia3ok = true;
                  client.emit('updatePlayers', status);
              } 
                else if(status.sedzia4 == username && status.sedzia4pass === password && status.sedzia4ok === false) {
                  client.set('username', username);
                  status.sedzia4ok = true;
                  client.emit('updatePlayers', status);
              }
                else if(status.sedzia5 == username && status.sedzia5pass === password && status.sedzia5ok === false) {
                  client.set('username', username);
                  status.sedzia5ok = true;
                  client.emit('updatePlayers', status);
              }
                else{
                  client.emit('playersLimit', status);
              }
                  client.emit('updatePlayers', status);
                  client.broadcast.emit('updatePlayers', status);
                  });




      client.on('disconnect', function () {
        client.get('username', function (username){
                  if (status.sedzia1 === username) {
                status.sedzia1ok = false;
               }

                  if (status.sedzia2 === username) {
                status.sedzia2ok = false;
               }
                  if (status.sedzia3 === username) {
                status.sedzia3ok = false;
               }
                  if (status.sedzia4 === username) {
                status.sedzia4ok = false;
               }
                  if (status.sedzia4 === username) {
                status.sedzia5ok = false;
               }

              client.broadcast.emit('updatePlayers', status);
                });
                });  


      client.on('aktualny2', function (zawodnikName) {
          console.log('mamy aktualnego ' + zawodnikName );
                if (status.zawodnik1 === zawodnikName) {
                  status.zawodnikAkt = status.zawodnik1;
                  client.broadcast.emit('updateZawodnik', status);

                 }
                 if (status.zawodnik2 === zawodnikName) {
                  status.zawodnikAkt = status.zawodnik2;
                  client.broadcast.emit('updateZawodnik', status);
                 }
                 if (status.zawodnik3 === zawodnikName) {
                  status.zawodnikAkt = status.zawodnik3;
                  client.broadcast.emit('updateZawodnik', status);
                 }

                });

      client.on('form', function(ocena){
            ocena.id = this.id;
        client.broadcast.emit('oceny', ocena);
      });
   client.on('popraw', function(ocena){
    sockety[ocena.id].emit('edytuj', ocena);
    });
      client.on('pokaz', function(){
          client.emit('wyniki', wyniki);
      });

      client.on('zatwierdz', function(ocena){
            oceny.push(ocena);
        wyniki = [];
        //z wszystkich ocen, ktore dostalismy
        for (var i in oceny){
          if(oceny.hasOwnProperty(i)){
            var flaga = false;
            var wynik = {
                         place:       1,
                         divisor:     1,
                         playerName:  oceny[i].playerName,
                         note:        parseInt(oceny[i].note, 10),
                         wynik:       0
                  };
            //sprawdz czy sledzimy juz wyniki zawodnika
            for(var j in wyniki){
              if(wyniki[j].playerName === wynik.playerName){
                wyniki[j].note += parseInt(wynik.note, 10);
                wyniki[j].divisor += 1;
                flaga = true;
              }
            }
            //nie sledzimy? to dodajmy go do sledzonych
            if(flaga === false){
            wyniki.push(wynik);
            }
          }
        }
        //policzmy srednia uzyskanych wynikow
        for(i in wyniki){
          if(wyniki.hasOwnProperty(i)){
            wyniki[i].note /= wyniki[i].divisor;
            wyniki[i].wynik = wyniki[i].note;
          }
        }
        //zbudujemy kolejnosc
        wyniki = wyniki.sort(compare);
                for(i in wyniki){
                    if(wyniki.hasOwnProperty(i)){
                        var k = parseInt(i,10);
                        if(k !== (wyniki.length-1)){
                                 if(compare(wyniki[k], wyniki[k+1]) === -1){ wyniki[k+1].place = (wyniki[k].place+1); }
                            else if(compare(wyniki[k], wyniki[k+1]) === 1) { wyniki[k+1].place = (wyniki[k].place-1); }
                            else if(compare(wyniki[k], wyniki[k+1]) === 0) { wyniki[k+1].place = wyniki[k].place;     }
                        }
                    }
                }
          console.log(wyniki.sort(compare));
          client.broadcast.emit('wyniki', wyniki.sort(compare));
        


   });
 
  }); 
server.listen(3000);
