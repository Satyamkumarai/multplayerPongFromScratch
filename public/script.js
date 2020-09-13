const dt = 20;              //delta time..(smoothness of the animation..)
const height = 800;
const width = 800;
var animateTimeObj;
//The canvas and the canvas context..
const canvas = document.getElementById('canvas')
const ctx =canvas.getContext('2d')


const point1 = V(400,450);
const point2 = V(300,400);

//The Ball Constructor..(params of the ball)
var ball = null;
// const ball = {
//     radius: 20,
//     position : V(300,300),
//     velocity  : V(Math.random() < 0.5 ? -0.4 : 0.4,Math.random()),
//     color : 'rgb(226, 43, 43)'
    
// }

const player1 = createPaddle({
    x:50,
    y0:height/2,   
    width:20,
    height:80,
    upKey : 'w',
    downKey:'s',
    minY:50,
    maxY:height-50,
    hitSide:'right',
    thisPlayer:true
})

const player2 = createPaddle({
    x:width-50,
    y0:height/2,   
    width:20,
    height:80,
    upKey:'ArrowUp',
    downKey:'ArrowDown',
    minY:50,
    maxY:height-50,
    hitSide:'left',
    thisPlayer:false
})
//Check is the ball touchinfg the edges then bounce off
function checkEdgeBounce(){

        if (ball.position.x >= width-ball.radius){
            ball.position.x = width-ball.radius-1;          //To prevent the ball from gettin stuck..
            ball.velocity.x*=-1
            if(Id != null)
                scorePoint(1);
            else
                scorePoint(2);
        }
        // else if  ( ball.position.x <=ball.radius){
        //     // ball.position.x = ball.radius+1
        //     // ball.velocity.x *= -1;
        //     scorePoint(2);
        // }
        if (ball.position.y >= height-ball.radius){
            ball.position.y = width-ball.radius-1;          //To prevent the ball from gettin stuck..
            ball.velocity.y*=-1
        }else if  ( ball.position.y <=ball.radius){
            ball.position.y = ball.radius+1
            ball.velocity.y *= -1;
        }   
    
}


function scorePoint(player){
    console.log(`score P${player}`);
    if (player == 1){
       //Call imcrement of player1 score..
        if (Id != null)
            socket.emit('score',{Id:Id,roomName:roomName});
    }else if (player== 2){
        if (Id == null)
        //call increment of player2 score..
            socket.emit('score',{Id:null,roomName:roomName});
    }
    //Set score will automatically be called..
    
}
//Util function draw a circle..
function drawCircle(x,y,r,color){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x,y,r,0,2* Math.PI);
    ctx.fill();
}

//Clears the canvas..
function clearCanvas(){
    ctx.clearRect(0,0,width,height);
}

//Use to move a ball object..
function moveCircle(){
    ball.position.add(ball.velocity.times(dt))
    
}

function lineBounce(line,ball){
    let point1 = line[0];
    let point2 = line[1];
    let lineVector = point2.minus(point1);
    let point1ToBall = ball.position.minus(point1);
    let proj = point1ToBall.clampedProj(lineVector);
    let displacement = point1ToBall.minus(proj);
    let distance = displacement.norm();
    let overlap = ball.radius-distance;

    if (distance <= ball.radius){
        //bounce!!
        ball.velocity.reflect(displacement);
        displacement.setNorm(overlap);
        ball.position.add(displacement);
    }

    
}

//draw Vectors
// point1.debugDraw(ctx);
// point2.debugDraw(ctx);
// lineVector.debugDraw(ctx,point1);
// point1ToBall.debugDraw(ctx,point1,1,false,'gold');
// displacement.debugDraw(ctx,point1.plus(proj),1,false,'tomato')
// ball.velocity.debugDraw(ctx,ball.position,1000,false,'lightgreen')
// proj.debugDraw(ctx,point1,1,false,'aqua');




//For Moving the ball using mouse..
// window.addEventListener('mousemove',(e)=>{
//     ball.position.x = e.pageX;
//     ball.position.y = e.pageY;
// })


//The main animation loop
//Repeatedly calls itself
function animate(){
    animateTimeObj =  setTimeout(animate,dt)
    //calls the frame function to draw a frame..
    frame();
}

//----------------------Main Functions--------------------------

function setup(){
    
    
    //The Setup function..
    canvas.height = height;
    canvas.width = width;    
}

//All the processing  that should happen in a frame..
function frame(){
    player1.move();
    player2.move();
    checkEdgeBounce();
    moveCircle();
    player1.checkHit();
    player2.checkHit();
    draw();                    //handles all the drawings of the frame..
    
}

//The draw loop All the drawings in a  frame 
function draw(){
    clearCanvas();
    drawCircle(ball.position.x,ball.position.y,ball.radius,ball.color);
    player1.draw(ctx);
    player2.draw(ctx);
}



//---------------------End------------------------------


//Actually Calling Them!..
setup();
// animate();
// restart();