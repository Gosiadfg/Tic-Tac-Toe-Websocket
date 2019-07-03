var server = require('ws').Server;
var s = new server({port:5001});
var rooms = [0,0];
var index_clients = [];
var room1_clients = [];
var room2_clients = [];
var win1 = 0;
var win2 = 0;
var block1 = 0;
var block2 = 0;
var game1 = 0;
var game2 = 0;
var style = 0;
var symbol = [0,1,0,1];

var winning = 
[
	[0,1,2],    
	[3,4,5],    
	[6,7,8],    
	[0,4,8],    
	[2,4,6],
	[0,3,6],    
	[1,4,7],
	[2,5,8]
];
var board1 =
	[0,0,0,
	0,0,0,
	0,0,0];
var board2 =
	[0,0,0,
	0,0,0,
	0,0,0];

s.on('connection',function(ws){

	function ab2str(buf) {
		var bufView = new Uint16Array(buf);
		var unis =""
		for (var i = 0; i < bufView.length; i++) {
			unis=unis+String.fromCharCode(bufView[i]);
		}
		var str="";
		for (var i = 0; i < unis.length; i++) {
			str=str+unis[i];
			i++;
		}
		return str;
	}
	function str2ab(str) {
		var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
		var bufView = new Uint16Array(buf);
		for (var i=0, strLen=str.length; i<strLen; i++) {
			bufView[i] = str.charCodeAt(i);
		}
		return buf;
	}

	ws.on('message',function(message){
		var message=ab2str(message);

		if(message=="index"){		
			index_clients.push(ws);
			reload();
		}
		else if(message==1 && game1==0){
			if(rooms[0]<2){
			rooms[0]++;
			if(rooms[0]==1) {
				ws.send(str2ab("Oczekiwanie na dołączenie przeciwnika..."));
				ws.send(str2ab("style"));
				win1=0;
				board1 =
				[0,0,0,
				0,0,0,
				0,0,0];
			}
			if(rooms[0]==2){
				block1=1;
				reload();
				ws.send(str2ab("Twój przeciwnik już jest gotowy."));
				ws.send(str2ab("Oczekiwanie na ruch przeciwnika..."));
				ws.send(str2ab("style"));
				room1_clients.forEach(function e(client){
					if (client!=ws){
						client.send(str2ab("Dołączył przeciwnik."));
						client.send(str2ab("Twój ruch."));
						client.send(str2ab("style2"));
					}
				});
				game1=1;
			}
			room1_clients.push(ws);
			reload();
			}	
		}
		else if(message==2 && game2==0){
			if(rooms[1]<2){
			rooms[1]++;
			if(rooms[1]==1){
				ws.send(str2ab("Oczekiwanie na dołączenie przeciwnika..."));
				ws.send(str2ab("style"));
				win2=0;
				board2 =
				[0,0,0,
				0,0,0,
				0,0,0];
			}
			if(rooms[1]==2){
				block2=1;
				reload();
				ws.send(str2ab("Twój przeciwnik już jest gotowy."));
				ws.send(str2ab("Oczekiwanie na ruch przeciwnika..."));
				ws.send(str2ab("style"));
				room2_clients.forEach(function e(client){
					if (client!=ws){
						client.send(str2ab("Dołączył przeciwnik."));
						client.send(str2ab("Twój ruch."));
						client.send(str2ab("style2"));
					}
				});
				game2=1;
			}
			room2_clients.push(ws);
			reload();
			}
		}
		else if(message==1 && game1==1){
			ws.send(str2ab(board1.toString()));
			rooms[0]++;
			room1_clients.push(ws);
			if (style==0){
				ws.send(str2ab("style2"));
				ws.send(str2ab("Twój ruch."));
				room1_clients.forEach(function e(client){
					if(client!=ws){
						client.send(str2ab("style"));
						client.send(str2ab("Oczekiwanie na ruch przeciwnika..."));
					}
				});
			}
			if (style==1){
				ws.send(str2ab("style"));
				ws.send(str2ab("Oczekiwanie na ruch przeciwnika..."));
				room1_clients.forEach(function e(client){
					if(client!=ws){
						client.send(str2ab("style2"));
						client.send(str2ab("Twój ruch."));
					}
				});
			}
			style=0;
			reload();
		}
		else if(message==2 && game1==1){
			ws.send(str2ab(board2.toString()));
			rooms[1]++;
			room2_clients.push(ws);
			if (style==0){
				ws.send(str2ab("style2"));
				ws.send(str2ab("Twój ruch."));
				room2_clients.forEach(function e(client){
					if (client!=ws){
						client.send(str2ab("style"));
						client.send(str2ab("Oczekiwanie na ruch przeciwnika..."));
					}
				});
			}
			if (style==1){
				ws.send(str2ab("style"));
				ws.send(str2ab("Oczekiwanie na ruch przeciwnika..."));
				room2_clients.forEach(function e(client){
					if(client!=ws){
						client.send(str2ab("style2"));
						client.send(str2ab("Twój ruch."));
					}
				});
			}
			style=0;
			reload();
		}
		else if(message=="escape"){
			closing();
		}
		else if(message=="style1"){
			style=1;
		}
		else if(message=="style0"){
			style=0;
		}
		else{
			for( var i = 0; i < room1_clients.length; i++){ 
			   if ( room1_clients[i] === ws) {
				 if (i==symbol[0]) board1[message[1]]=1;
				 if (i==symbol[1]) board1[message[1]]=2;
				 if(win1==0)winner1();
				 room1_clients.forEach(function e(client){
					client.send(str2ab(board1.toString()));
					if(client!=ws){	
						if(win1==0){
							client.send(str2ab("style2"));
							client.send(str2ab("Twój ruch."));
						}
					}
				});	
				if (win1==0){
					ws.send(str2ab("style"));
					ws.send(str2ab("Oczekiwanie na ruch przeciwnika..."));
				}
			   }
			}
			
			for( var i = 0; i < room2_clients.length; i++){ 
			   if ( room2_clients[i] === ws) {
				  if (i==symbol[2]) board2[message[1]]=1;
				  if (i==symbol[3]) board2[message[1]]=2;
				  if(win2==0)winner2();
				  room2_clients.forEach(function e(client){
					  client.send(str2ab(board2.toString()));	  
					  if(client!=ws && win2==0){  
							  client.send(str2ab("style2"));
							  client.send(str2ab("Twój ruch."));
					  }
				  });			
				  if (win2==0){
					ws.send(str2ab("style"));
					ws.send(str2ab("Oczekiwanie na ruch przeciwnika..."));
				  }
			   }
			}
		}
	});
	
	ws.on('close',function(){		
		closing();
	});
	
	function closing(){
		
		for( var i = 0; i < index_clients.length; i++){ 
		   if ( index_clients[i] === ws) {
			 index_clients.splice(i, 1); 
		   }
		}

		for( var i = 0; i < room1_clients.length; i++){ 
		   if ( room1_clients[i] === ws) {
				room1_clients.splice(i, 1); 
				if (i==0){
					var x = symbol[0];
					symbol[0]=symbol[1];
					symbol[1]=x;
				}
				rooms[0]--;
					
				room1_clients.forEach(function e(client){
					if(client!=ws)client.send(str2ab("Przeciwnik się rozłączył!"));
					client.send(str2ab("style"));
				});
				if(rooms[0]==0){
					block1=0;
					game1=0;
					style=0;
					index_clients.forEach(function e(client){
						client.send(str2ab("unblock1"));
					});
				}
				reload();	
		   }
		}
		
		for( var i = 0; i < room2_clients.length; i++){ 
		   if ( room2_clients[i] === ws) {	
				room2_clients.splice(i, 1); 	
				if (i==0){
					var x = symbol[2];
					symbol[2]=symbol[3];
					symbol[3]=x;
				}
				rooms[1]--;
					
				room2_clients.forEach(function e(client){
					if(client!=ws)client.send(str2ab("Przeciwnik się rozłączył!"));
					client.send(str2ab("style"));
				});
				if(rooms[1]==0){
					block2=0;
					game2=0;
					style=0;
					index_clients.forEach(function e(client){
						client.send(str2ab("unblock2"));
					});
				}
				reload();
		   }
		}
	}
	function reload(){
		index_clients.forEach(function e(client){
			client.send(str2ab(rooms.toString()));
			if(block1==1)client.send(str2ab("block1"));
			if(block2==1)client.send(str2ab("block2"));
		});
	}
	function winner1(){
		winning.forEach(function(c){	
			if(board1[c[0]] == board1[c[1]] && board1[c[1]] == board1[c[2]] && board1[c[1]] != "")
			{
				win1=1;
				game1=0;
				reload();
				room1_clients.forEach(function e(client){
					client.send(str2ab("style"));
					client.send(str2ab("GAME OVER"));
				});
			}	
		 });
	}
	function winner2(){
		winning.forEach(function(c){	
			if(board2[c[0]] == board2[c[1]] && board2[c[1]] == board2[c[2]] && board2[c[1]] != "")
			{
				win2=1;
				game2=0;
				reload();
				room2_clients.forEach(function e(client){
					client.send(str2ab("style"));
					client.send(str2ab("GAME OVER"));		
				});
			}
		 });
	}
});