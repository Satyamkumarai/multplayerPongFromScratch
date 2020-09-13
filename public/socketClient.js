

div = document.createElement('div')
div.classList.add('welcome')
div.id = "waiting"
div.innerText = 'Waiting for Player 2 '
document.body.appendChild(div)


socket.on('welcome', (data) => {
	console.log('Welcome!' + data)
})



// socket.on('start', (data) => {
// 	console.log(`Recieved Start Message`);
// 	//   animate()
// 	//   restart()
// })


socket.on('player2-connected', name => {
	console.log(`PLayer Connected:`);
	console.log(name);
	// animate()
	//   restart()

})

socket.on('disconnect', () => {
	
	clearTimeout(animateTimeObj)
})

socket.on('player-disconnected', room => {
	if (room === roomName){

		socket.emit('which-player',{Id:Id,roomName:roomName})
		console.log('Disconnect')
		
		clearTimeout(animateTimeObj)
		// restart()
	}

})
socket.on('which-player',data=>{
	var waiting = document.getElementById('waiting')

	if(waiting){
		waiting.innerHTML = `Player${data.player} Disconnected! `
	}
})
// Math.random() < 0.5 ? -0.4 : 0.4,Math.random()



socket.on('ball', restart);




socket.on('START',(data)=>{
	//set the score..
	var waiting = document.getElementById('waiting')
	if(waiting){
		waiting.innerHTML = ""
	}
	clearTimeout(animateTimeObj)
	setScore(data);
	animate()
	
})




function restart(data){
	
	//flip for player2
	console.log(`Restart with vel ${data.velX},${data.velY}`);
	const flip = (data.player1Id === Id) ? 1:-1;
	console.log(data.player1Id === Id);
	const winScalex = width/800
	const winScaley = height/800
	ball = {
		radius: 20,
		position: V(data.posX*width, data.posY*height),
		velocity: V(data.velX*flip*winScalex, data.velY*winScaley),
		color: 'rgb(226, 43, 43)'

	}
	console.log(ball);

	// socket.emit('get-ball-vel',true);
}

socket.on('bounce',data=>{
	const flip = (Id === null) ? -1:1
	ball.velocity.x = data.velX*flip
	ball.velocity.y = data.velY
	ball.position.x = data.posX
	ball.position.y = data.posY
	
})


function setScore(data){
	
	p1 =  document.getElementById('player1Score');
	p2 = document.getElementById('player2Score');
	p1.innerHTML = data.p1;
	p2.innerHTML  = data.p2;
	console.log(`Setting score`);
	//Then the animate is called
}
