var xOff=300,yOff=0,zoom=3,iterations=50,mode=0,prevH=0;
var xOrig,yOrig,xRes,yRes,pressed=false,expanded=true,display=false,move=false,advancedGen=false;
var width=window.innerWidth,height=window.innerHeight;
var cmx=0,cmy=0,curX,curY,tmpXOff,tmpYOff,tmpZoom;
var a,b,a2,b2;
var pixels=[];
var scan=0,thread=null;
var power=2,julA,julB,tmpPow,tmpJA,tmpJB,isMandel=true,tmpIsMandel=true,containsXY;
var gradientCols=[255,255,255,0,0,0,255,0,0,0,0,0,0,255,0,0,0,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,50,179,216,253,255,255,255,255,194,0,140,46,0,255,0,0,255,255,0,0,255,0,0,255,255,0,0,255,255,0,255];
//               |                 |             |             |             |                       |                                                 |                                                     |
var startAt=[0,6,12,18,24,33,48,66,84,84,84],lengths=[0,0,0],id=0,selected=0;
var selectedCol=5,rd,gr,bl,cycleLength=50;
var date=new Date(),time=date.getTime();
var ctx,imgData=null,imgDataFull=null,ctx2,ctx3,c3W,c3H;
var expressions=["PI","E","pow","sqrt","cbrt","sin","cos","tan","floor","abs","ceil","random","log","log10","exp"];
//escape panel
var moveescape=false;
var eX,eY,eOffX=1,eOffY=1;

function init(){
  //SET EVENT LISTENERS
  var element=document.getElementById("overlaycanvas");
  element.addEventListener("mousedown",function(event){press(event,true);});
  element.addEventListener("mousemove",function(event){canvasInteract(event);});
  element.addEventListener("mouseup",function(event){press(event,false);});
  element=document.getElementsByTagName("body")[0];
  element.addEventListener("keydown",function(event){setMode(event);});
  element.addEventListener("mousemove",function(event){setEP(event);});
  element=document.getElementById("colorpanel");
  element.addEventListener("mousemove",function(event){slide(event);});
  element.addEventListener("mouseup", function(event){sPress(event,0);});
  document.getElementsByClassName("slider")[0].addEventListener("mousedown",function(event){sPress(event,1);});
  element=document.getElementById("movebar");
  element.addEventListener("mousedown",function(event){setEM(event,true);});
  element.addEventListener("mouseup", function(event){setEM(event,false);});
  element=document.getElementById("colorchooser");
  element.addEventListener("mousemove",function(event){colorMove(event);});
  element.addEventListener("mousedown",function(event){pickColor(event);});

  
  //This was supposed to be an automatic script generator, but due to caching issues, this didn't work out.
  /*for (var i=0;i<100;i++){
    $('customscripts').append("<script id=\"customscript\"></script>");
  }*/
  ctx2=document.getElementById("overlaycanvas").getContext("2d");
  ctx3=document.getElementById("escapecanvas").getContext("2d");
  var canvas=document.getElementById("mandelcanvas");
  canvas.width=width;
  canvas.height=height;
  canvas.style.width=""+width+"px";
  canvas.style.height=""+height+"px";
  var canvas2=document.getElementById("overlaycanvas");
  canvas2.width=width;
  canvas2.height=height;
  canvas2.style.width=""+width+"px";
  canvas2.style.height=""+height+"px";
  canvas2=document.getElementById("rastercanvas");
  canvas2.width=width;
  canvas2.height=height;
  canvas2.style.width=""+width+"px";
  canvas2.style.height=""+height+"px";
  canvas2=document.getElementById("escapecanvas");
  canvas2.width=window.innerWidth*0.29;
  canvas2.height=window.innerWidth*0.08;
  c3W=window.innerWidth*0.29;
  c3H=window.innerWidth*0.08;
  
  paintRaster();
  gradientSetup();
  var parts=(startAt[selectedCol+1]-startAt[selectedCol])/3+1;
  var colors="";
  for (var b=0;b<parts-1;b++){
    colors+="rgb("+(gradientCols[startAt[selectedCol]+3*b])+","+(gradientCols[startAt[selectedCol]+3*b+1])+","+(gradientCols[startAt[selectedCol]+3*b+2])+") "+(b*(100/(parts-1)))+"%, ";
  }
  colors+="rgb("+(gradientCols[startAt[selectedCol]])+","+(gradientCols[startAt[selectedCol]+1])+","+(gradientCols[startAt[selectedCol]+2])+") 100%";
  document.getElementById("gradientdisplay").style.background="linear-gradient(to right, "+colors+")";
  parseUrl();
  setSlide();
}

function paintRaster(){
  var ctx=document.getElementById("rastercanvas").getContext("2d");
  ctx.fillStyle="#222";
  ctx.fillRect(0,0,width,height);
  ctx.fillStyle="#777";
  var sqS=7;
  for (var h=0;h<window.innerHeight+sqS;h+=sqS){
    for (var w=0;w<window.innerWidth+sqS;w+=2*sqS){
      ctx.fillRect(((h/sqS)%2)*sqS+w,h,sqS,sqS);
    }
  }
  
  ctx=document.getElementById("choosercanvas").getContext("2d");
  for (var i=0;i<4096;i++){
      ctx.fillStyle="rgb("+Math.floor(i/256)*17+","+Math.floor(i%256/16)*17+","+Math.floor(i%256%16)*17+")";
      ctx.fillRect(Math.floor(i%64)*10,Math.floor(i/64)*10,10,10);
  }
}

function parseUrl(){
  var tmpStr="";
  var count=-1,url=window.location.href;
  var foundQuest=false,toScan=false;
  for (var i=0;i<url.length;i++){
    if (url.charAt(i)=='?'){foundQuest=true;}
    if (foundQuest){
      if (url.charAt(i)=='='){toScan=true;}
      else if (url.charAt(i)=='&'||i==url.length-1){
        if (i==url.length-1){tmpStr+=url.charAt(i);}
        toScan=false;
        if (count==-1){advancedGen=(tmpStr=="true"?true:false);}
        else if (count==0){advancedGen?document.getElementById("functionin2").value=tmpStr:document.getElementById("functionin").value=tmpStr;}
        else if (count==1){document.getElementById("iterations").value=tmpStr;}
        else if (count==2){document.getElementById("xOff").value=tmpStr;}
        else if (count==3){document.getElementById("yOff").value=tmpStr;}
        else if (count==4){document.getElementById("zoom").value=tmpStr;}
        else if (count==5){selectedCol=parseInt(tmpStr);}
        else if (count==6){cycleLength=parseInt(tmpStr);}
        else if (count==7){prevH=parseInt(tmpStr);}
        count++;
        tmpStr="";
      }else if(toScan){
        tmpStr+=url.charAt(i);
      }
    }
  }
  console.log("1: "+advancedGen);
  if (foundQuest){
    document.getElementById("zoom").value=parseFloat(document.getElementById("zoom").value)*(prevH/height);
    document.getElementById("checkinput").innerHTML=advancedGen?document.getElementById("functionin2").value:document.getElementById("functionin").value;
    advancedGen?pushFunction2(0):pushFunction(0);
    document.getElementById("overlay").style.display="block";
    document.getElementById("alertpanel").style.display="block";
    /*document.getElementById("xOff").value=parseFloat(document.getElementById("xOff").value)*(prevH/height);
    document.getElementById("yOff").value=parseFloat(document.getElementById("yOff").value)*(prevH/height);*/
  }else{
    setStuff();
  }
}

function gradientSetup(){
  for (var a=0;a<startAt.length-1;a++){
    var parts=(startAt[a+1]-startAt[a])/3;
    var colors="";
    for (var b=0;b<parts-1;b++){
      colors+="rgb("+(gradientCols[startAt[a]+3*b])+","+(gradientCols[startAt[a]+3*b+1])+","+(gradientCols[startAt[a]+3*b+2])+") "+(b*(100/(parts-1)))+"%, ";
    }
    colors+="rgb("+(gradientCols[startAt[a]+3*(parts-1)])+","+(gradientCols[startAt[a]+3*(parts-1)+1])+","+(gradientCols[startAt[a]+3*(parts-1)+2])+") 100%";
    document.getElementsByClassName("gradientselector")[a].style.background="linear-gradient(to bottom right, "+colors+")";
    console.log("linear-gradient(to bottom right, "+colors+")");
  }
}

function gradient(inID){
  document.getElementById("escapepanel").style.display="none";
  var parts=(startAt[inID+1]-startAt[inID])/3+1;
  var colors="";
  for (var b=0;b<parts-1;b++){
    colors+="rgb("+(gradientCols[startAt[inID]+3*b])+","+(gradientCols[startAt[inID]+3*b+1])+","+(gradientCols[startAt[inID]+3*b+2])+") "+(b*(100/(parts-1)))+"%, ";
  }
  colors+="rgb("+(gradientCols[startAt[inID]])+","+(gradientCols[startAt[inID]+1])+","+(gradientCols[startAt[inID]+2])+") 100%";
  document.getElementById("gradientdisplay").style.background="linear-gradient(to right, "+colors+")";
  selectedCol=inID;
} 

function confirmGradient(){
  closePopups(3);
  if (thread!=null){
    clearInterval(thread);
  }
  if (mode==3){mode=0;}
  date=new Date();
  time=-date.getTime();
  scan=0;
  thread=setInterval(recolor,1);
}

function mainGenerate(){
  ctx=document.getElementById("mandelcanvas").getContext("2d");
  document.getElementById("upperinfo").style.display="none";
  if (imgData!=null){
    ctx.clearRect(0,0,width,height);
    document.getElementById("rastercanvas").getContext("2d").putImageData(imgDataFull,cmx,cmy);
  }
  imgData=ctx2.createImageData(width,10);
  imgDataFull=ctx2.createImageData(width,height);
  scan=0;
  if (mode==3){mode=0;}
  document.getElementById("mandelcanvas").style.marginLeft="0";
  document.getElementById("mandelcanvas").style.marginTop="0";
  tmpXOff=parseFloat(document.getElementById("xOff").value);
  tmpYOff=parseFloat(document.getElementById("yOff").value);
  tmpZoom=parseFloat(document.getElementById("zoom").value);
  cmx=0;
  cmy=0;
  if (thread!=null){
    clearInterval(thread);
  }
  pixels=[];
  thread=setInterval(generate,1);   //set a low refresh time, let computer calculate as fast as it can. You go, little man!
}

function generate(){
  var rescale=1;
  if (prevH>0){
    rescale=prevH/height;
  }
  for (var h=scan;h<scan+10;h++){
    for (var w=0;w<width;w++){
      a2=(w-width/2-xOff/zoom)/(500/zoom);
      b2=(h-height/2-yOff/zoom)/(500/zoom);
      if (isMandel){
        a=a2;
        b=b2;
      }else{
        if (advancedGen){getJulia(a2,b2);}
        a=julA;
        b=-julB;
      }
      /*if (power>2){
        angle=Math.atan(b2/a2);
        if (a2<0){angle+=Math.PI;}
        lilAngle=lilAngle=Math.atan(b/a);
        if (a<0){lilAngle+=Math.PI;}
        magnitude=Math.sqrt(a2*a2+b2*b2);
      }*/
      pixels.push(generateIndividual(0));
      //pixels.push(generateExp());
    }
  }
  paint();
  paint2();
  scan+=10;
}

function generateIndividual(type){
  var aTmp;
  var v,magnitude;
  for (var i=0;i<iterations;i++){
    if (a2*a2+b2*b2>=4){
      return i+1-Math.log(Math.log(Math.sqrt(a2*a2+b2*b2)))/Math.log(power);
    }
    if (power==2){
      aTmp=a2;
      a2=a2*a2-b2*b2+a;
      b2=2*(aTmp*b2)+b;
    }else{
      v=Math.atan(b2/a2);
      if (a2<0){v+=Math.PI;}
      v*=power;
      magnitude=Math.pow(Math.sqrt(a2*a2+b2*b2),power)
      a2=magnitude*Math.cos(v)+a;
      b2=magnitude*Math.sin(v)+b;
    }
    if (type==1){
      ctx2.lineTo(a2*(height/zoom)+xOff/zoom+width/2+cmx,b2*(height/zoom)+yOff/zoom+height/2+cmy);
      ctx3.lineTo(((i+1)/iterations)*c3W,c3H-(Math.sqrt(a2*a2+b2*b2)/2)*(c3H-10));
    }
  }
  return -1;
}

  //return i;
  //return i+1-Math.log(Math.log(Math.hypot(a2,b2)))/Math.log(power);
  //return i+(i+1-Math.log(Math.log(Math.sqrt(a2*a2+b2*b2)))/Math.log(2))/iterations;
  //return i+1-Math.log(Math.log(Math.sqrt(a2*a2+b2*b2))/Math.log(2))/Math.log(2);
  //return i+1-Math.log((Math.log(a2*a2+b2*b2)/2)/Math.log(2))/Math.log(2);
  //return i+1-(Math.log(Math.log(Math.sqrt(a2*a2+b2*b2))/Math.log(10)/Math.log(10)))/(Math.log(power)/Math.log(10));

function generateExp(){
  for (var i=0;i<iterations;i++){
     if (a2*a2+b2*b2>=4){
       return i; 
     }
     var e=Math.E;
     var tmA=a2;
     a2=e^tmA*Math.cos(b2)-0.65;
     b2=e^tmA*Math.sin(b2);
  }
  return -1;
}

function isHotkey(keycode){
  var hotkeys=[83,77,73,71,70,69,67,85,27,13];
  for (var i=0;i<hotkeys.length;i++){
    if (keycode==hotkeys[i]){return true;}
  }
  return false;
}

function setMode(event){
  if (!display){
    document.getElementById("escapepanel").style.display="none";
    if (isHotkey(event.keyCode)){
      document.getElementById("generate").focus();
    }
    document.getElementById("upperinfo").style.display="none";
    var hi=document.getElementById("hoverinfo").style;
    hi.left="-1000px";
    hi.top="-1000px";
    hi.display="none";
    var kc=event.keyCode;
    if (kc==83){
      document.getElementById("overlaycanvas").style.cursor="default";
      mode=0;
    }else if (kc==77){
      document.getElementById("overlaycanvas").style.cursor="move";
      mode=1;
    }else if (kc==73){
      document.getElementById("overlaycanvas").style.cursor="default";
      document.getElementById("hoverinfo").style.display="block";
      mode=2;
      canvasInteract();
    }else if (kc==69){
      document.getElementById("overlaycanvas").style.cursor="default";
      document.getElementById("escapepanel").style.display="block";
      mode=3;
    }else if(kc==71){   //G - generate
      closePopups(-1);
      setStuff();
    }else if(kc==70){   //F - function
      closePopups(-1);
      setFunction();
      display=true;
    }else if(kc==67){   //C - colors
      closePopups(-1);
      setColor();
    }else if(kc==85){   //U - URL
      closePopups(-1);
      display=true;
      setTimeout(getUrl,100);
    }else if(kc==27){   //ESC
      closePopups(-1);
    }else if(kc==13&&mode==0&&move){   //Enter-generate
      setStuff();
    }
    if(kc==27&&mode==0&&xRes>0&&yRes>0&&move){   //Esc
      xRes=0;
      yRes=0;
      document.getElementById("zoom").value=tmpZoom;
      document.getElementById("xOff").value=tmpXOff;
      document.getElementById("yOff").value=tmpYOff;
      document.getElementById("overlaycanvas").style.cursor="default";
    }
  }else if(event.keyCode==27){   //ESC
    closePopups(-1);
  }
  paint2(event);
  move=false;
}

function press(event,inId){
  pressed=inId;
  if (pressed&&mode==0&&!move){
    xOrig=event.clientX;
    yOrig=event.clientY;
    xRes=0;
    yRes=0;
    document.getElementById("zoom").value=tmpZoom;
  }else if (pressed&&mode==1||pressed&&move){
    curX=event.clientX;
    curY=event.clientY;
  }
  if (!pressed&&mode==0&&xRes>0&&yRes>0){
    document.getElementById("overlaycanvas").style.cursor="move";
    document.getElementById("upperinfo").style.display="block";
    document.getElementById("upperinfo").innerHTML="Esc - Cancel | Enter - Generate | Drag to reposition";
    move=true;
  }
  paint2(event);
}

function canvasInteract(event){
  if (mode==0&&pressed&&!move){
    xRes=event.clientX-xOrig;
    yRes=(xRes)*(height/width);
    if (xRes>0&&yRes>0){
      document.getElementById("zoom").value=tmpZoom*(xRes/window.innerWidth);
      document.getElementById("xOff").value=tmpXOff+(window.innerWidth/2-(xOrig-cmx+xRes/2))*zoom;
      document.getElementById("yOff").value=tmpYOff+(window.innerHeight/2-(yOrig-cmy+yRes/2))*zoom;
    }else{
      document.getElementById("zoom").value=tmpZoom;
      document.getElementById("xOff").value=tmpXOff;
      document.getElementById("yOff").value=tmpYOff;
    }
  }else if(move&&pressed){
    document.getElementById("xOff").value=(parseFloat(document.getElementById("xOff").value)-(event.clientX-curX)*zoom);
    document.getElementById("yOff").value=(parseFloat(document.getElementById("yOff").value)-(event.clientY-curY)*zoom);
    xOrig+=(event.clientX-curX);
    yOrig+=(event.clientY-curY);
    paint2(event);
    curX=event.clientX;
    curY=event.clientY;
  }else if (mode==1&&pressed){
    cmx+=(event.clientX-curX);
    cmy+=(event.clientY-curY);
    curX=event.clientX;
    curY=event.clientY;
    document.getElementById("mandelcanvas").style.marginLeft=""+cmx+"px";
    document.getElementById("mandelcanvas").style.marginTop=""+cmy+"px";
    document.getElementById("xOff").value=tmpXOff+cmx*zoom;
    document.getElementById("yOff").value=tmpYOff+cmy*zoom;
  }else if(mode==2){
    try{    //if you click I, the script throws an error for event. Simple fix.
      document.getElementById("hoverinfo").style.left=""+(event.clientX+20)+"px";
      document.getElementById("hoverinfo").style.top=""+(event.clientY+20)+"px";
      var pos=(event.clientY-cmy)*width+(event.clientX-cmx);
      var hi=document.getElementById("hoverinfo");
      hi.style.right="initial";
      hi.style.bottom="initial";
      if (event.clientX-cmx<0||event.clientY-cmy<0||event.clientX-cmx>width||event.clientY-cmy>height){
        hi.style.left="-1000px";
        hi.style.top="-1000px";
      }else{
        color(pixels[pos]);
        var iters=Math.floor(pixels[pos]);
        if (iters==-1){
          iters=iterations;
          document.getElementById("colorsample").style.backgroundColor="black";
        }else{
          document.getElementById("colorsample").style.backgroundColor="rgb("+Math.floor(rd)+","+Math.floor(gr)+","+Math.floor(bl)+")";
        }
        document.getElementById("iterationinfo").innerHTML="Iterations: "+iters;
        document.getElementById("iterationinfo2").innerHTML="Re: "+(event.clientX-cmx-width/2-xOff/zoom)/(height/zoom)+"<br>Im: "+(-(event.clientY-cmy-height/2-yOff/zoom)/(height/zoom));
        if (event.clientX+hi.offsetWidth+40>window.innerWidth){
          hi.style.left="initial";
          hi.style.right=""+(window.innerWidth-event.clientX+20)+"px";
        }
        if (event.clientY+hi.offsetHeight+40>window.innerHeight){
          hi.style.top="initial";
          hi.style.bottom=""+(window.innerHeight-event.clientY+20)+"px";
        }
      }
    }catch(e){}
  }
  paint2(event);
}

function setStuff(){
  document.getElementById("upperinfo").style.display="none";
  xRes=0;
  yRes=0;
  if (move){
    paint2();
    document.getElementById("overlaycanvas").style.cursor="default";
    move=false;
  }
  iterations=parseInt(document.getElementById("iterations").value);
  xOff=parseFloat(document.getElementById("xOff").value);
  yOff=parseFloat(document.getElementById("yOff").value);
  zoom=parseFloat(document.getElementById("zoom").value);
  if (iterations==null||iterations==undefined){iterations=0;}
  else if (xOff==null||xOff==undefined){xOff=0;}
  else if (yOff==null||yOff==undefined){yOff=0;}
  else if (zoom==null||zoom==undefined){yOff=0;}
  scan=0;
  date=new Date();
  time=date.getTime();
  mainGenerate();
}

function openToolbox(){
  document.getElementById("overlay").style.display="block";
  document.getElementById("infocontainer").style.display="block";
}

function setFunction(){
  display=true;
  document.getElementById("overlay").style.display="block";
  var name=advancedGen?"functionpanel2":"functionpanel";
  document.getElementById(name).style.display="block";
}

function setColor(){
  document.getElementById("overlay").style.display="block";
  document.getElementById("colorpanel").style.display="block";
  setSlide();
}

function getUrl(){
  display=true;
  document.getElementById("overlay").style.display="block";
  document.getElementById("sharepanel").style.display="block";
  var url="http://picturelements.github.io/mandelbrot?adv="+advancedGen+"&func="+(advancedGen?document.getElementById("functionin2"):document.getElementById("functionin")).value+"&iters="+document.getElementById("iterations").value+"&xOff="+document.getElementById("xOff").value+"&yOff="+document.getElementById("yOff").value+"&zoom="+document.getElementById("zoom").value+"&color="+selectedCol+"&mod="+cycleLength+"&prevH="+height;
  document.getElementById("urlout").value=url;
  document.getElementById("urlout").select();
}

function setAdvanced(){
  document.getElementsByClassName("popup")[0].style.display="none";
  document.getElementById("functionpanel2").style.display="block";
}

function goBack(){
  document.getElementsByClassName("popup")[1].style.display="none";
  document.getElementById("functionpanel").style.display="block";
}

function closePopups(inId){
  display=false;
  document.getElementById("overlay").style.display="none";
  if (inId==-1){    //closes EVERYTHING
    var popups=document.getElementsByClassName("popup");
    for (var i=0;i<popups.length;i++){
      popups[i].style.display="none";
    }
  }else{
    document.getElementsByClassName("popup")[inId].style.display="none";
  }
}

function closePopups2(inElement){
  inElement.parentElement.style.display="none";
}

function expando(){
  if (expanded){
    document.getElementById("buttonpanel").style.marginLeft="-"+(document.getElementById("buttonpanel").offsetWidth)+"px";
  }else{
    document.getElementById("buttonpanel").style.marginLeft="0";
  }
  expanded=!expanded;
}

function displayFunction(){
  if (!advancedGen){
    tmpPow=2;
    tmpJA=0;
    tmpJB=0;
    var input=document.getElementById("functionin").value;
    var values=[],foundNumber=false,prevWasNo=false,tmpString="";
    for (var i=0;i<input.length;i++){
      if (isNumber(input.charAt(i))){
        if (!foundNumber&&input.charAt(i-1)=='-'){tmpString="-";}
        tmpString+=input.charAt(i);
        foundNumber=true;
        prevWasNo=true;
      }else{
        if (prevWasNo==true){
          prevWasNo=false;
          foundNumber=false;
          values.push(parseFloat(tmpString));
          tmpString="";
        }
      }
    }
    if (prevWasNo){values.push(parseFloat(tmpString));}
    tmpIsMandel=0;
    if (values.length==1){
      tmpIsMandel=true;
      tmpPow=Math.abs(Math.floor(values[0]));
    }else if(values.length==2){
      tmpPow=Math.abs(Math.floor(values[0]));
      if (input.endsWith("i")){
        tmpJA=0;
        tmpJB=values[1];
      }else{
        tmpJA=values[1];
        tmpJB=0;
      }
    }else if(values.length==3){
      tmpPow=Math.abs(Math.floor(values[0]));
      tmpJA=values[1];
      tmpJB=values[2];
    }
    var tA="+"+tmpJA,tB="+"+tmpJB;
    if (tmpJA<0){tA=tmpJA;}
    if (tmpJB<0){tB=tmpJB;}
    console.log("Function: z^"+tmpPow+""+tA+""+tB+"i");
    if (tmpIsMandel||tmpJA==0&&tmpJB==0){
      document.getElementById("funcout").innerHTML="Function: z<sup>"+tmpPow+"</sup>+c (Mandelbrot set)";
    }else{
      document.getElementById("funcout").innerHTML="Function: z<sup>"+tmpPow+"</sup>"+tA+""+tB+"i (Julia set)";
    }
  }
}

function isNumber(inChar){
  for (var a=0;a<10;a++){
    if (inChar==a){return true;}
  }
  if (inChar=="."){return true;}
  return false;
}

function checkFunction(){
  if (!getJulia(0,0)){
    document.getElementById("funcout2").innerHTML="ERROR: Malformed syntax";
    return false;
  }
  return true;
}

function pushFunction(inId){
  document.getElementById("escapepanel").style.display="none";
  displayFunction();
  advancedGen=false;
  closePopups(0);
  isMandel=tmpIsMandel;
  power=tmpPow;
  julA=tmpJA;
  julB=tmpJB;
  scan=0;
  if (inId==1){resetStuff(); prevH=0; setStuff();}   //includes mainGenerate()
}

function pushFunction2(inID){
  document.getElementById("escapepanel").style.display="none";
  $('customscripts').find('script').first().remove();
  //$('#inserthere').before("<script id=\"customscript\"></script>");
  //$("#body").prepend("<script id=\"customscript\"></script>");
  advancedGen=true;
  var rePart="0.125",imPart="0.8";
  var input=document.getElementById("functionin2").value;
  var startpos=1,startpos2;
  if (input.endsWith("i")){startpos=2;}
  var endP=0,startP=0;
  for (var a=input.length-startpos;a>0;a--){
    if (input.charAt(a)=="("){startP++;}
    else if (input.charAt(a)==")"){endP++;}
    if (startP==endP&&startP>0){
      startpos2=a-1;
      break;
    }
  }
  var progress=0,skip=false;
  var tmpStr="";
  for (var a=0;a<input.length-startpos+1;a++){
    if (input.charAt(a)=="^"){progress=1;}
    else if (progress>0){
      if (progress==1&&isNumber(input.charAt(a))){
        tmpStr+=input.charAt(a);
      }else if (progress==1){
        power=Math.floor(parseFloat(tmpStr));
        tmpStr="";
        skip=true;
        progress++;
      }
      if (progress==2&&a<startpos2){
        if (tmpStr==""&&input.charAt(a)=='-'&&skip||!skip){tmpStr+=input.charAt(a);}
        skip=false;
      }else if(progress==2){
        rePart=tmpStr;
        tmpStr="";
        progress++;
        skip=true;
      }
      if (progress==3&&a>=startpos2){
        if (tmpStr==""&&input.charAt(a)=='-'&&skip||!skip){tmpStr+=input.charAt(a);}
        skip=false;
      }
    }
  }
  imPart=tmpStr;
  var regex;
  for (var a=0;a<expressions.length;a++){
    if (expressions[a]!="PI"&&expressions[a]!="E"){
      regex=new RegExp(expressions[a],"gi");
    }else{
      regex=new RegExp(expressions[a],"g");
    }
    rePart=rePart.replace(regex,"Math."+expressions[a]);
    imPart=imPart.replace(regex,"Math."+expressions[a]);
  }
  console.log(power+", "+rePart+", "+imPart);
  document.getElementById("customscript").innerHTML="\nfunction getJulia(x,y){\n  try{\n    julA="+rePart+";\n    julB="+imPart+";\n  }catch(e){return false;}\n}\n";
  isMandel=false;
  scan=0;
  if (checkFunction&&inID==1){
    closePopups(1);
    scan=0;
    resetStuff();
    setStuff();
  }
}

function resetStuff(){
  if (isMandel&&power==2){
    document.getElementById("xOff").value="300";
  }else{
    document.getElementById("xOff").value="0";
  }
  document.getElementById("yOff").value="0";
  document.getElementById("zoom").value="3";
}

function recolor(){
  paint();
  paint2();
  scan+=10;
}

function save(){
  if (scan<height&&scan>0){
    alert("Hold your horses!\n\nWait until the fractal has finished rendering!\n");
  }else{
    var c=document.getElementById("mandelcanvas");
    var d=c.toDataURL("image/png");
    var w=window.open('about:blank','image from canvas');
    w.document.write("<img src='"+d+"' alt='from canvas'/>");
  }
}

function setEM(event,inID){
  moveescape=inID;
  ex=event.clientX;
  ey=event.clientY;
}

function setEP(event){
  if (moveescape){
    eOffX+=((event.clientX-ex)/window.innerWidth)*100;
    eOffY+=((event.clientY-ey)/window.innerWidth)*100;
    document.getElementById("escapepanel").style.left=""+eOffX+"vw";
    document.getElementById("escapepanel").style.top=""+eOffY+"vw";
    ex=event.clientX;
    ey=event.clientY;
  }
}

function editCol(element){
  var elements=document.getElementsByClassName("coloredit");
  var id;
  for (var i=0;i<elements.length;i++){
    if (elements[i]==element){id=i; break;}
  }
  document.getElementById("colorchooser").style.display="block";
  //alert("Selected: "+id);
}

function colorMove(event){
  var vw=window.innerWidth/100,div=document.getElementById("hoverpicker");
  var xPos=event.clientX-(30*vw), yPos=event.clientY-(window.innerHeight/2-15.25*vw);
  //console.log(xPos+":"+yPos);
  if (xPos>=vw&&xPos<=24*vw&&yPos>=6.5*vw&&yPos<=29.5*vw){
    div.style.display="block";
    div.style.left=""+(xPos/vw-2.7)+"vw";
    div.style.top=""+(yPos/vw-2.7)+"vw";
    var ctx=document.getElementById("pickercanvas").getContext("2d");
    ctx.fillStyle="#444"
    ctx.fillRect(0,0,100,100);
    id=Math.floor(((yPos-6.5*vw)/(23*vw))*64)*64+Math.floor(((xPos-vw)/(23*vw))*64);
    var xOff=(0.5-(((xPos-vw)/(23*vw))%(1/64))*64)*30,yOff=(0.5-(((yPos-6.5*vw)/(23*vw))%(1/64))*64)*30;
    for (var h=-3;h<4;h++){
      for (var w=-3;w<4;w++){
        var tmpI=id+h*64+w;
        //&&Math.floor(id/64)+h>=0&&Math,floor(id/64)+h<64
        if (id%64+w>=0&&id%64+w<64&&id>=0&&id<4096){
          var r=Math.floor(tmpI/256)*17, g=Math.floor(tmpI%256/16)*17, b=Math.floor(tmpI%256%16)*17;
          if (h==0&&w==0){ctx.strokeStyle="rgb("+(255-r)+","+(255-g)+","+(255-b)+")";}
          ctx.fillStyle="rgb("+r+","+g+","+b+")";
          ctx.fillRect(35+w*30+xOff,35+h*30+yOff,30,30);
        }
      }
    }
    ctx.fillStyle="rgba(255,255,255,0.6)";
    ctx.lineWidth=3;
    for (var i=0;i<8;i++){
      ctx.fillRect(i*30+4+xOff,0,2,100);
      ctx.fillRect(0,i*30+4+yOff,100,2);
    }
    ctx.beginPath();
    ctx.moveTo(45+xOff,45+yOff);
    ctx.lineTo(55+xOff,55+yOff);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(55+xOff,45+yOff);
    ctx.lineTo(45+xOff,55+yOff);
    ctx.stroke();
    //console.log(id+":"+xOff+":"+yOff);
  }else{
    div.style.display="none";
  }
}

function pickColor(event){
  var r=Math.floor(id/256)*17, g=Math.floor(id%256/16)*17, b=Math.floor(id%256%16)*17;
}

function moveHere(element){
  var elements=document.getElementsByClassName("gradientelement");
  for (var i=0;i<elements.length;i++){
    if (elements[i]==element){selected=i; break;}
  }
  document.getElementById("pointer").style.marginLeft=""+(1.5*selected*4.5)+"vw"
}

function paint(){
  var counter=0;
  for (var h=scan;h<scan+10;h++){
    for (var w=0;w<width;w++){
      if (pixels[h*width+w]==-1){
        /*ctx.fillStyle="black";
        ctx.fillRect(w,h,1,1);*/
        imgData.data[counter]=0;
        imgData.data[counter+1]=0;
        imgData.data[counter+2]=0;
        imgData.data[counter+3]=255;
        imgDataFull.data[scan*width*4+counter]=0;
        imgDataFull.data[scan*width*4+counter+1]=0;
        imgDataFull.data[scan*width*4+counter+2]=0;
        imgDataFull.data[scan*width*4+counter+3]=255;
      }else{
        /*shade=Math.floor((iterations-pixels[h*width+w])/iterations*255);
        ctx.fillStyle="rgb("+shade+","+shade+","+shade+")";*/
        /*color(h*width+w);
        ctx.fillStyle="rgb("+Math.floor(rd)+","+Math.floor(gr)+","+Math.floor(bl)+")";
        ctx.fillRect(w,h,1,1);*/
        color(pixels[h*width+w]);
        imgData.data[counter]=Math.floor(rd);
        imgData.data[counter+1]=Math.floor(gr);
        imgData.data[counter+2]=Math.floor(bl);
        imgData.data[counter+3]=255;
        imgDataFull.data[scan*width*4+counter]=Math.floor(rd);
        imgDataFull.data[scan*width*4+counter+1]=Math.floor(gr);
        imgDataFull.data[scan*width*4+counter+2]=Math.floor(bl);
        imgDataFull.data[scan*width*4+counter+3]=255;
      }
      counter+=4;
    }
  }
  ctx.putImageData(imgData,0,scan);
  if (scan>=window.innerHeight){
    var time_out;
    if (time<0){
      date=new Date();
      time=date.getTime()+time;
      time_out="Color set in: ";
    }else{
      date=new Date();
      time=date.getTime()-time;
      time_out="Set rendered in: ";
    }
    if (time/60000>=1){
      time_out+=""+Math.floor(time/60000)+"m ";
      time-=(Math.floor(time/60000)*60000);
    }
    if (time/1000>=1){
      time_out+=""+Math.floor(time/1000)+"s ";
      time-=(Math.floor(time/1000)*1000);
    }
    time_out+=""+time+"ms ";
    document.getElementById("upperinfo").style.display="block";
    document.getElementById("upperinfo").innerHTML=time_out;
    setTimeout(function(){document.getElementById("upperinfo").style.display="none";}, 3500);
    clearInterval(thread);
    paintRaster();
    /*$('#body').find('script').first().remove();
    $("#body").prepend("<script id=\"customscript\"></script>");*/
  }
}

function color(inID){
  var mod=inID%cycleLength;
  var percentage=mod/cycleLength;
  var steps=(startAt[selectedCol+1]-startAt[selectedCol])/3;
  for (var i=steps;i>=0;i--){
    if (percentage>=i/steps){
      percentage=(percentage-i/steps)*steps;
      rd=gradientCols[startAt[selectedCol]+3*(i%steps)]+(gradientCols[startAt[selectedCol]+3*((i+1)%steps)]-gradientCols[startAt[selectedCol]+3*(i%steps)])*percentage;
      gr=gradientCols[startAt[selectedCol]+3*(i%steps)+1]+(gradientCols[startAt[selectedCol]+3*((i+1)%steps)+1]-gradientCols[startAt[selectedCol]+3*(i%steps)+1])*percentage;
      bl=gradientCols[startAt[selectedCol]+3*(i%steps)+2]+(gradientCols[startAt[selectedCol]+3*((i+1)%steps)+2]-gradientCols[startAt[selectedCol]+3*(i%steps)+2])*percentage;
      break;
    }
  }
}

function paint2(event){
  ctx2.clearRect(0,0,window.innerWidth,window.innerHeight);
  ctx2.strokeStyle="red";
  if (xRes>0&&yRes>0&&mode==0||move){
    ctx2.beginPath();
    ctx2.rect(xOrig,yOrig,xRes,yRes);
    ctx2.stroke();
  }else if (pressed&&mode==1){
    ctx2.beginPath();
    ctx2.moveTo(0,Math.floor(window.innerHeight/2));
    ctx2.lineTo(window.innerWidth,Math.floor(window.innerHeight/2));
    ctx2.stroke();
    ctx2.beginPath();
    ctx2.moveTo(Math.floor(window.innerWidth/2),0);
    ctx2.lineTo(Math.floor(window.innerWidth/2),window.innerHeight);
    ctx2.stroke();
    var perc=parseFloat(document.getElementById("zoom").value)/zoom;
    var inW=Math.floor(window.innerWidth*perc),inH=Math.floor(window.innerHeight*perc);
    //console.log(inW+" - "+inH);
    ctx2.beginPath();
    ctx2.rect(Math.floor(window.innerWidth/2-inW/2),Math.floor(window.innerHeight/2-inH/2),inW,inH);
    ctx2.stroke();
  }else if(mode==3){
    var tX=event.clientX-cmx,tY=event.clientY-cmy;
    a2=(tX-width/2-xOff/zoom)/(500/zoom);
    b2=(tY-height/2-yOff/zoom)/(500/zoom);
    if (isMandel){
      a=a2;
      b=b2;
    }else{
      a=julA;
      b=-julB;
    }
    ctx2.moveTo(tX+cmx,tY+cmy);
    ctx3.clearRect(0,0,1000,1000);
    ctx3.strokeStyle="#444";
    ctx3.lineWidth=2;
    ctx3.beginPath();
    ctx3.moveTo(0,c3H-(Math.sqrt(a2*a2+b2*b2)/2)*(c3H-10));
    generateIndividual(1);
    ctx2.stroke();
    ctx3.stroke();
    for (var x=0;x<c3W;x++){
      color((x/c3W)*iterations);
      ctx3.fillStyle="rgb("+Math.floor(rd)+","+Math.floor(gr)+","+Math.floor(bl)+")";
      ctx3.fillRect(x,0,1,10);
    }
  }
  if (thread!=null){
    ctx2.beginPath();
    ctx2.moveTo(0,scan+10);
    ctx2.lineTo(window.innerWidth,scan+10);
    ctx2.stroke();
  }
}
