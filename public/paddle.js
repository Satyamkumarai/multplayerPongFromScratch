// const name = prompt('Wnter your name..')
// const socket = io('http://localhost:3000')
const socket = io(`http://${serverIp}:${serverPort}`)
console.log(`New Player Message sent`);
socket.emit('new-player',roomName,'Player1')
//Id is used to identify player1
var Id = null;
socket.on('player1-Id',data=>{
    Id = data.id
    if (data.id){
        console.log(`GOT Player1 ID : ${Id}`);
    }
})


function lineBounce(line,ball,hitSide){
    let point1 = line[0];
    let point2 = line[1];
    let lineVector = point2.minus(point1);
    let point1ToBall = ball.position.minus(point1);
    let proj = point1ToBall.clampedProj(lineVector);
    let displacement = point1ToBall.minus(proj);
    let distance = displacement.norm();
    let overlap = ball.radius-distance;

    if (distance <= ball.radius && hitSide === 'right'){
        //bounce!!
        ball.velocity.reflect(displacement);
        displacement.setNorm(overlap);
        ball.position.add(displacement);
        socket.emit('bounce',{roomName:roomName,velX:ball.velocity.x,velY:ball.velocity.y,posX:ball.position.x,posY:ball.position.y,Id:Id})
    }
    // if (Id === null && hitSide==='right'){
    // }else if (Id !== null && hitSide === 'right'){
        // socket.emit('bounce',{roomName:roomName,velX:ball.velocity.x,velY:ball.velocity.y,posX:ball.position.x,posY:ball.position.y,Id:Id})

    // }

    
}



function createPaddle({x,y0,width,height,upKey,downKey,minY,maxY,hitSide,thisPlayer}){
    let y = y0;
    let velocity = 0;
    let counter=0;
    const winScaley = 800/800
    if (thisPlayer){
        
        document.getElementById('canvas').addEventListener('touchstart',e=>{
            console.log(e);
            counter++;
            if (e.changedTouches[0].clientY >400){      
                socket.emit('downK',{key:downKey,roomName:roomName})
                velocity = +0.5*winScaley;
            }else{
                socket.emit('downK',{key:upKey,roomName:roomName})
                console.log(`touchStart ${e.changedTouches[0].clientY} hieght/2 = {}`);
                velocity = -0.5*winScaley;
            }
            if (counter>3){
                socket.emit('updatePaddle',{y:y/height,roomName:roomName})
            }
        })
        document.getElementById('canvas').addEventListener('touchend',e=>{
            console.log(e);
            console.log(`touchend ${e.clientY}`);
            // if (e.clientY >height/2){
                // }else if (e.clientY<=height/2){
                    //     socket.emit('upK',{key:downKey,roomName:roomName})
                    // }
            socket.emit('upK',{key:upKey,roomName:roomName})
            velocity = 0;
            socket.emit('updatePaddle',{y:y/height,roomName:roomName})
            
        })
        window.addEventListener('keydown',function(e){
            let key = e.key;
            counter++;
            if (key === upKey){
                console.log(`key Pressed : ${key} Sent data downK `);
                socket.emit('downK',{key:key,roomName:roomName})
                velocity = -0.5*winScaley;
                console.log(`vel: ${velocity} win:${winScaley}`);
            }else if (key === downKey){
                console.log(`key Pressed : ${key} Sent data downK `);
                
                socket.emit('downK',{key:key,roomName:roomName})
                velocity = 0.5*winScaley;
            }
            if (counter>3){
                socket.emit('updatePaddle',{y:y/height,roomName:roomName})
            }
        })
        window.addEventListener('keyup',(e)=>{
            let key = e.key;
            counter=0;
            if (key === upKey || key === downKey){
                console.log(`key Pressed : ${key} Sent data upK `);
                
                socket.emit('upK',{key:e.key,roomName:roomName})
                velocity = 0;
                socket.emit('updatePaddle',{y:y/height,roomName:roomName})
            }
        })
        
    }else{
        socket.on('downK',(data)=>{
            console.log('Down');
            console.log(`Data:`);
            console.log(data);
            console.log(`Up key : ${data.key}`);
            if (data.key===upKey){
                velocity=-0.5*winScaley
            }else if (data.key===downKey){
                velocity=0.5*winScaley
            }
        })
        socket.on('upK',(data)=>{
            console.log('up');
            console.log(`Data `);
            console.log(data);
            if (data.key===upKey || data.key=== downKey)
                velocity=0;
        })
        socket.on('updatePaddle',data=>{
            y = data.y*height
        })
    }
    function getHitLine(){
        if (hitSide === 'left')
        return [
            V(x - width / 2,y - height / 2),
            V(x -  width/2 ,y + height / 2)
        ];
        else if (hitSide === 'right')
        return [
            V(x + width/2 , y - height /2 ),
            V(x + width/2 , y + height / 2)
        ];
    }
    function draw(ctx){
        ctx.fillStyle = 'white'
        ctx.fillRect(x - width/2, y - height/2,width,height)
    }
    function move(){
        // if (y<)
        y+=velocity*dt; 
        y = Math.min(y,maxY);
        y = Math.max(minY,y);
    }
    function checkHit(){
        let hitLine = getHitLine();
        lineBounce(hitLine,ball,hitSide);
    }
    return {
        move,
        draw,
        checkHit

    }
}