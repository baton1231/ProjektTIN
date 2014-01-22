$(document).ready(function () {
    'use strict';
    var socket = io.connect('http://localhost:3000');



     $( '#referee' ).click(function(){
      	$('body').load('referee.html', function(){

	
				var username = prompt("Podaj login:");
				var password = prompt("Podaj haslo:");
				socket.emit('join', username, password);
      			$('#sedzia').append('<h2>' + username + '</h2>');
      			     socket.on('playersLimit', function (status) {

		    alert("Mamy już wszyskich sędziów, lub podałeś błędne dane");
			       window.location.replace("http://localhost:3000");
	         });


        socket.on('updateZawodnik', function (status) {

         var to = document.getElementById('name');
         to.value = status.zawodnikAkt;
         var too = document.getElementById('sedziaName');
         too.value = username;
         

       });

       
          
        

         // socket.on('oceniajPonownie', function(){

         //  alert("Oceń zawodnika ponownie, bo podałeś zła ocenę")
         //  document.getElementById("wyslijOcene").style.display='block';


         // });

socket.on('edytuj', function(msg){
          $('#editList').append('<li>'+msg.playerName+'<button>Edytuj</button></li>');
          $('#editList li').last().data('oceny', msg);
          $('#editList li button').click(function(){
            $('#editForm').show();
            $('#editForm #name').val($(this).parent().data('oceny').playerName);
            $('#editForm #ocena').val($(this).parent().data('oceny').note);
            $('#editForm #sedziaName').val($(this).parent().data('oceny').sedziaName);
            var liElem = $(this).parent();
             
            $('#editForm #wyslijOcene').click(function(){
              if(liElem.css('display')==='list-item'){
                if ($('#editForm #ocena').val() === null || $('#editForm #ocena').val() === ""){
                  alert("Podaj ocenę");
                }
                else{
                  var modOcena = {               playerName:      $('#editForm #name').val(),
                                                 note:            $('#editForm #ocena').val(),
                                                 sedziaName:      $('#editForm #sedziaName').val()
                                                 
                                               };
                  liElem.remove();
                 
                  socket.emit('form', modOcena);
                  $('#editForm').hide();
                }
              }
            });
          });
        });




       $('#disconnect').click(function(){
              socket.emit('disconnect', username);
              window.location.replace("http://localhost:3000");
            });




$('#wyslijOcene').click(function(){
  if ($('#name').val() === null || $('#name').val() === ""){
                        alert("Nie ma nazwy zawodnika");
          }
          else if($('#ocena').val() === null || $('#ocena').val() === ""){
                        alert("Ocen zawodnika");
          }
        else{
            var ocena = {         playerName:     $('#name').val(),
                                  note:           $('#ocena').val(),
                                  sedziaName:     $('#sedziaName').val()

              };
         
        
              socket.emit('form', ocena);
             
            }
          });
               
 
             

        });
      });


  

   $( '#admin' ).click(function(){
      	$('body').load('admin.html', function(){

  		socket.emit('updatePlayers', status);

  		socket.on('updatePlayers', function (status) {

        if (status.sedzia1ok == true) {
            $('#sedzia1').attr("src", "green.png");}
        else {
            $('#sedzia1').attr("src", "red.png");}
        if (status.sedzia2ok == true) {
            $('#sedzia2').attr("src", "green.png");}
        else {
            $('#sedzia2').attr("src", "red.png");}
        if (status.sedzia3ok == true) {
            $('#sedzia3').attr("src", "green.png");}
        else {
            $('#sedzia3').attr("src", "red.png");}
        if (status.sedzia4ok == true) {
            $('#sedzia4').attr("src", "green.png");}
        else {
            $('#sedzia4').attr("src", "red.png");}
        if (status.sedzia5ok == true) {
            $('#sedzia5').attr("src", "green.png");}
        else {
            $('#sedzia5').attr("src", "red.png");}
        });  


       $('#aktualnyButton').click(function(){

      
      var x = document.getElementById("zawodnicy").selectedIndex;
      var zawodnikName = document.getElementsByTagName("option")[x].value;
          socket.emit('aktualny2', zawodnikName);  
          
           });  });



  socket.on('oceny', function(oceny) {
          $('#gradeList').append('<li><b>Nazwa zawodnika</b> | ' + oceny.playerName + ' | <b>Sędzia</b> |  ' + oceny.sedziaName + 
          ' | <b>Ocena</b> | ' + oceny.note  +
          ' | <button class="zatwierdz">Zatwierdz</button><button class="popraw">Popraw</button></li>');
          $('#gradeList li').last().data('oceny', oceny);
          $('li .popraw').click(function(){
            if($(this).parent().data('oceny')!==null){
              socket.emit('popraw', $(this).parent().data('oceny'));
            }
            $(this).parent().remove();
          });
          $('li .zatwierdz').click(function(){
            if($(this).parent().data('oceny')!==null){
              socket.emit('zatwierdz', $(this).parent().data('oceny'));
            }
            $(this).parent().remove();
          });
        });



	});

 $('#fan').click(function(){
        $('body').load('fan.html', function(){
      socket.emit('pokaz');
      socket.on('wyniki', function(wyniki){
        console.log('czytam wyniki');
        $('#scoresTable tbody').html('');
        for(var i in wyniki){
          if(wyniki.hasOwnProperty(i)){
                        $('#scoresTable tbody').append('<tr><td>' + 
                        wyniki[i].place + '</td><td>' + wyniki[i].playerName + '</td><td>' + wyniki[i].note.toFixed(1) +  '</td><td>' + wyniki[i].divisor + '</td></tr>');
          }
        }
            });
        });
    });


 });
