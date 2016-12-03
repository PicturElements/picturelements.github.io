/*
* How to use:
*   1. Create canvas element. If not ID'd "canvas", change name below
*   2. Call generate()
*
* What the variables do:
*   cellSize: Each point is placed in a grid, and there can only be one point per grid, so the cell size defines the point density.
*   points:   Variable to store points. Should not be touched
*   padding:  Adds extra definition where a point can lie in each cell. A 0.25 padding means a point can at minimum lie 12.5% from each side. 
*/

var canv=document.getElementById("canvas"),ctx=canv.getContext("2d");
var cellSize=100;
var points=[];
var padding=0.25;

function generate(){
  canv.width=window.innerWidth;
  canv.height=window.innerHeight;
  canv.style.width=window.innerWidth+"px";
  canv.style.height=window.innerHeight+"px";
  generatePoints();
  paint();
}

function generatePoints(){
  points=[];
  var active=1-padding;
  for (var h=-cellSize;h<window.innerHeight+cellSize;h+=cellSize){
    for (var w=-cellSize;w<window.innerWidth+cellSize;w+=cellSize){
      points.push([w+Math.random()*cellSize*active+padding/2,h+Math.random()*cellSize*active+padding/2]);
    }
  }
}

function paint(){
  var sw=Math.floor(window.innerWidth/cellSize)+3;
  var sh=Math.floor(window.innerHeight/cellSize)+2;
  for (var i=0;i<points.length;i++){
    ctx.beginPath();
    ctx.arc(points[i][0],points[i][1],2,0,2*Math.PI);
    ctx.fill();
  }
  
  var sq=[0,sw+1,1,sw];
  
  for (var h=0;h<sh;h++){
    for (var w=0;w<sw-1;w++){
      var point=h*sw+w;
      
      ctx.beginPath();
      ctx.moveTo(points[point][0],points[point][1]);
      ctx.lineTo(points[point+sw][0],points[point+sw][1]);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(points[point][0],points[point][1]);
      ctx.lineTo(points[point+1][0],points[point+1][1]);
      ctx.stroke();
      
      var rand=Math.round(Math.random());
      
      var coord=intersect(toFunc(points[point+sq[0]],points[point+sq[1]]),toFunc(points[point+sq[3]],points[point+sq[2]]));
      
      var l1=Math.min(proxi(coord,points[point+sq[2]]),proxi(coord,points[point+sq[3]]));
      var l2=Math.min(proxi(coord,points[point+sq[0]]),proxi(coord,points[point+sq[1]]));
      
      var farthest=l1>l2?0:1;
      ctx.beginPath();
      ctx.moveTo(points[point+sq[farthest*2]][0],points[point+sq[farthest*2]][1]);
      ctx.lineTo(points[point+sq[farthest*2+1]][0],points[point+sq[farthest*2+1]][1]);
      ctx.stroke();
    }
  }
}

function atan2(x,y){
  var result=Math.atan(y/x);
  if (x<0){result+=Math.PI;}
  return result;
}

function toFunc(p1,p2){
  var dx=p2[0]-p1[0],dy=p2[1]-p1[1];
  var k=dy/dx;
  var m=p1[1]-k*p1[0];
  return [k,m];
}

function intersect(f1,f2){
  var tmpx1=f1[0];
  f1[0]+=f2[0]*-1;
  f2[1]+=f1[1]*-1;
  var x=f2[1]/f1[0];
  return [x,tmpx1*x+f1[1]];
}

function proxi(c1,c2){
  return Math.sqrt(Math.pow(c1[0]-c2[0],2)+Math.pow(c1[1]-c2[1],2));
}
