var xStart=0,yStart=0,selWin=0;
var prevX=0,prevY=0;
var clicked=false,resize=false,setFullscreen=0,attr,select=false,preventEvents=false,expanded=false,slide=false;
var windows=[],origNames=[],winCount=0;
var last=0;
var unix24Hrs=86400000;
var contextAssort=[
  [0,1,2,3],
  [4,5,6,7],
  [8,9,10]
];
var colors=[
  ["#600","#d42","#d77","#ff5e5e 0%,#bd1929 38%,#0e0000 100%"],
  ["#060","#3a2","#7f5","#64e25e 0%,#098022 38%,#051700 100%"],
  ["#005","#53f","#29f","#64a4c4 0%,#1c5d9e 38%,#1c0935 100%"],
  ["#a40","#d72","#da4","#ffbb5e 0%,#b14b03 38%,#350f00 100%"],
  ["#317","#74a","#85f","#ae41cc 0%,#53136d 38%,#000000 100%"],
  ["#222","#333","#777","#696969 0%,#232323 50%,#000000 100%"],
  ["#999","#aaa","#ddd","#e8e8e8 0%,#a0a0a0 50%,#1f1f1f 100%"]
];
var specCols=["#68c464 0%,#1c5d9e 38%,#50005f 100%"];
var DEF_WIN_W=40,DEF_WIN_H=25;
var backgrounds=["Abstract.jpg","Bouncy.jpg","Gimignano.jpg","Flower.jpg","Bucks.jpg","Leaf.jpg","LonelyRoad.jpg","Flowers.jpg","Mandelbrot.png","Match.jpg","Leaves.png"];
contextShow=false;

//localStorage-editable variables
var taskArr=[1,2,21,3],oftenUsed=[];
var tzi=localStorage.getItem("tzIndex"),tzo=localStorage.getItem("tzOffset");
var tzIndex=tzi!=null?tzi:0,tzOffset=tzo!=null?tzo:0;
//localStorage.setItem("taskArr",taskArr);
var tmpArr=localStorage.getItem("taskArr");
taskArr=tmpArr!=null?tmpArr.split(","):taskArr;
if (localStorage.getItem("winW")!=null){
  DEF_WIN_W=parseInt(localStorage.getItem("winW"));
  DEF_WIN_H=parseInt(localStorage.getItem("winH"));
}
var ou=localStorage.getItem("oftenUsed");
if (ou!=null){oftenUsed=ou.split(",");}
var colId=2,backId=8;
var ci=localStorage.getItem("colId");
if (ci!=null){colId=parseInt(ci);}
var bi=localStorage.getItem("backId");
if (bi!=null){backId=parseInt(bi);}

var programData=[
  {name: "Error", url: "", icon: "error", keywords: ""},
  {name: "Home", url: "https://picturelements.github.io/index", icon: "home", keywords: "home,homepage,index,information"},
  {name: "Sudoku Solver", url: "https://picturelements.github.io/sudokuSolver", icon: "sudokusolver", keywords: "sudoku,solver,games,interactive"},
  {name: "Mandelbrot", url: "https://picturelements.github.io/mandelbrot", icon: "mandelbrot", keywords: "mandelbrot,julia,set,generator,fractal,interactive,math,canvas"},
  {name: "Pitchfork Emporium", url: "https://pitchforkemporium.github.io/", icon: "pitchforkemporium", keywords: "pitchfork,emporium,store,webshop,reddit,api"},
  {name: "Boids", url: "https://aquaplexus.net/fishSim", icon: "boids", keywords: "boids,craig,reynolds,interactive,fish,simulation"},
  {name: "HTML Editor", url: "https://picturelements.github.io/editor", icon: "htmleditor", keywords: "html,editor,css,interactive,gadget"},
  {name: "Bézier", url: "https://picturelements.github.io/bezier", icon: "bezier", keywords: "bezier,bézier,interactive,gadget"},
  {name: "Is it Prime?", url: "https://picturelements.github.io/isitprime", icon: "isitprime", keywords: "prime,generator,math,information"},
  {name: "N:th Prime", url: "https://picturelements.github.io/nthPrime", icon: "nthprime", keywords: "nth,prime,generator,math,information"},
  {name: "reddit Live 2.0", url: "https://picturelements.github.io/redditLive", icon: "redditlive", keywords: "reddit,live,api,information"},
  {name: "Egg Hunt", url: "https://picturelements.github.io/egghunt", icon: "egghunt", keywords: "egg,hunt,confused,travolta,game,reddit,easter"},
  {name: "Game of Life", url: "https://aquaplexus.net/gameoflife", icon: "gameoflife", keywords: "game,life,interactive,simulation,conway"},
  {name: "Hit Lawyer", url: "https://picturelements.github.io/hitLawyer", icon: "hitlawyer", keywords: "hit,lawyer,gadget"},
  {name: "Fractal", url: "https://aquaplexus.net/fractal", icon: "fractal", keywords: "fractal,generator,interactive,math"},
  {name: "Multiples", url: "https://picturelements.github.io/multiples", icon: "multiples", keywords: "multiples,math,interactive"},
  {name: "Fireworks", url: "https://aquaplexus.net/firework", icon: "fireworks", keywords: "fireworks,interactive,gadget,canvas"},
  {name: "Phone Snake", url: "https://picturelements.github.io/phonesnake", icon: "phonesnake", keywords: "phone,snake,game,interactive"},
  {name: "Back Dropper", url: "https://picturelements.github.io/backdropper", icon: "backdropper", keywords: "back,dropper,library,background,canvas"},
  {name: "Parrots", url: "https://picturelements.github.io/parrots", icon: "parrots", keywords: "parrots,dank,reddit,party,epilepsy"},
  {name: "Smoke", url: "https://picturelements.github.io/smoke", icon: "smoke", keywords: "smoke,3d,canvas,math"},
  {name: "404.html", url: "https://picturelements.github.io/404", icon: "404", keywords: "404,terminal,console,greentext"},
  {name: "Matrix", url: "https://picturelements.github.io/matrix", icon: "matrix", keywords: "matrix,math,multiplication"}
];

document.body.addEventListener("mousedown",function(event){winSelect=true; xStart=event.clientX; yStart=event.clientY; hideSearch();});
document.body.addEventListener("mousemove",function(event){try{moveWindow(event);}catch(e){}});
document.body.addEventListener("mouseup",function(event){try{release(event);}catch(e){}});
document.getElementById("search").addEventListener("keyup",search);
document.getElementById("searchbar").addEventListener("mousedown",function (event){showSearch(event);});
document.getElementById("home").addEventListener("mousedown",function (event){showHome(event);});
document.getElementsByClassName("poweritem")[0].addEventListener("mousedown",function (){restart();});
document.getElementsByClassName("poweritem")[1].addEventListener("mousedown",function (){powerOff();});
document.getElementsByClassName("contextitem")[0].addEventListener("mousedown",function (event){contextOpen(event,false);});
document.getElementsByClassName("contextitem")[1].addEventListener("mousedown",function (event){contextOpen(event,true);});
document.getElementsByClassName("contextitem")[2].addEventListener("mousedown",function (event){contextEdit();});
document.getElementsByClassName("contextitem")[3].addEventListener("mousedown",function (event){contextPin(0);});
document.getElementsByClassName("contextitem")[4].addEventListener("mousedown",function (event){contextPin(1);});
document.getElementsByClassName("contextitem")[5].addEventListener("mousedown",function (){contextUnpin();});
document.getElementsByClassName("contextitem")[6].addEventListener("mousedown",function (event){contextAddWin(event);});
document.getElementsByClassName("contextitem")[7].addEventListener("mousedown",function (){contextClose();});
document.getElementsByClassName("contextitem")[8].addEventListener("mousedown",function (){toggleFullscreen();});
document.getElementsByClassName("contextitem")[9].addEventListener("mousedown",function (){contextShow=!contextShow;});
document.getElementsByClassName("contextitem")[10].addEventListener("mousedown",function (){openSettings("backH");});
document.getElementById("context").addEventListener("mousedown",function (){document.getElementById("context").style.display="none";});
document.getElementById("desktop").addEventListener("mousedown",function(event){
  xStart=event.clientX;
  yStart=event.clientY;
  if (!clicked){select=true;}
  var elem=document.getElementsByClassName("desktoplink");
  for (var i=0;i<elem.length;i++){
    elem[i].setAttribute("selected",false);
  }
  document.getElementById("context").style.display="none";
  hideSearch();
  document.getElementById("clockbar").style.display="none";
  showContext(event,2);
  event.stopPropagation();
});
document.getElementById("search").addEventListener("mousedown",function(event){showSearchFull(event);});

function setup(){
  var parent=document.getElementById("desktop");
  for (var i=0;i<programData.length;i++){
    if (i>oftenUsed.length-1){oftenUsed.push(0);}
    else{oftenUsed[i]=parseInt(oftenUsed[i]);}
    origNames.push(programData[i].name);
    if (localStorage.getItem("customTitle"+i)!=null){
      programData[i].name=localStorage.getItem("customTitle"+i);
    }
    var el=document.createElement("div");
    el.setAttribute("class","desktoplink");
    if (i==0){el.setAttribute("style","display:none");}
    el.setAttribute("title",programData[i].name);
    el.setAttribute("selected","false");
    el.setAttribute("onclick","selectIcon(event,"+i+",false)");
    el.addEventListener("mousedown",function(event){showContext(event,0)});
    el.innerHTML="<div class=\"dimg\" style=\"background-image:url(https://picturelements.github.io/images/win_icons/"+programData[i].icon+".png)\"></div> <p class=\"ddesc\">"+programData[i].name+"</p>";
    parent.appendChild(el);
  }
  for (var i=0;i<taskArr.length;i++){
    addTaskbarIcon(taskArr[i],"null",0,programData[taskArr[i]].name,programData[taskArr[i]].icon,true);
  }
  for (var i=-14;i<15;i++){
    var el=document.createElement("option");
    el.innerHTML="UTC"+(i<1?"":"+")+""+(i!=0?i:"");
    document.getElementById("timezone").appendChild(el);
  }
  var tz=new Date().getTimezoneOffset()/-60;
  document.getElementById("timezone").getElementsByTagName("option")[0].innerHTML="Local (UTC"+(tz<0?"":"+")+""+(tz!=0?tz:"")+")";
  setCols();
  rez();
  setTimeout(function(){
  var elem=document.getElementById("loadscreen"); elem.innerHTML="<p id=\"loadmsg\">Starting up...</p><div id=\"loadercontainer\"><div id=\"loader\"></div><div id=\"loader2\"></div><div id=\"loader3\"></div>"; elem.style.backgroundColor="#268eee";},500);
}
setup();

function setCols(){
  document.getElementById("specCols").innerHTML=".specColor{background-color:"+colors[colId][0]+"; border-color:"+colors[colId][0]+";}\n.window[active=\"true\"] .infoCol{background-color:"+colors[colId][1]+";}\n.borderCol{border-color:"+colors[colId][2]+" !important;}\n.grad{background: -moz-linear-gradient(-45deg, "+colors[colId][3]+"); background: -webkit-linear-gradient(-45deg, "+colors[colId][3]+"); background: linear-gradient(135deg, "+colors[colId][3]+"); background: linear-gradient(135deg, "+colors[colId][3]+");}"+(backId!=0?".backOverride{background:none; background-image:url(https://picturelements.github.io/images/wallpapers/"+backgrounds[backId-1]+");}":"")+"";
}

function addWindow(id,title,contStr,w,h){
  oftenUsed[id]++;
  localStorage.setItem("oftenUsed",oftenUsed);
  tmpUrl=id==1?programData[id].url+"?"+(new Date().getTime()):programData[id].url;
  var elem=document.createElement("div");
  elem.setAttribute("class","window");
  var err="";
  var data={
    icon: programData[id].icon,
    name: programData[id].name
  };
  if (id==0){
    if (title!="Settings"){
      data.icon="error";
      err="<div id=\"errcontent\"><div id=\"errimg\"></div><div id=\"errmsg\">"+contStr+"</div></div>";
      elem.setAttribute("type","error");
    }else{
      var wins=document.getElementsByClassName("window");
      for (var i=0;i<wins.length;i++){
        if (wins[i].getAttribute("type")=="settings"){
          windows[i].collapsed=false;
          moveToTop(i);
          return;
        }
      }
      data.icon="cogbig";
      err="<div id=\"errcontent\">"+document.getElementById("settingsbuffer").innerHTML+"</div>";
      elem.setAttribute("type","settings");
    }
    data.name=title
  }else{
    elem.setAttribute("type",id);
  }
  var inner="<div class=\"infobar infoCol\" id=\""+winCount+"\"><div class=\"close\" title=\"Close\" onclick=closeWin("+winCount+")>✕</div><div class=\"max\" title=\"Toggle\" onclick=toggle("+winCount+")>◳</div><div class=\"min\" title=\"Minimize\" onclick=minWin("+winCount+")>_</div><div class=\"reload\" title=\"Reload\" onclick=reloadWin("+winCount+")>↻</div><div class=\"winicon\" style=\"background-image:url(https://picturelements.github.io/images/win_icons/"+data.icon+".png)\"></div><div class=\"wintitle\">"+data.name+"</div></div><iframe class=\"content\" src=\""+(id==0?tmpUrl:"")+"\"></iframe><div class=\"loadingoverlay\"><div id=\"loader\"></div><div id=\"loader2\"></div><div id=\"loader3\"></div></div>"+err+"<div class=\"resize\" scale=\"lw\"></div><div class=\"resize\" scale=\"lwh\"></div><div class=\"resize\" scale=\"h\"></div><div class=\"resize\" scale=\"wh\"></div><div class=\"resize\" scale=\"w\"></div>";
  elem.innerHTML=inner;
  elem.setAttribute("active",true);
  elem.id=winCount;
  document.getElementById("desktop").appendChild(elem);
  if (id==0){
    document.getElementById("desktop").lastChild.addEventListener("mousedown",function(event){event.stopPropagation();});
  }
  var resizers=elem.getElementsByClassName("resize");
  for (var i=0;i<resizers.length;i++){
    resizers[i].addEventListener("mousedown",function(event){try{press(event,true);}catch(e){}});
  }
  var elm=elem.getElementsByClassName("infobar")[0];
  elm.addEventListener("mousedown",function(event){try{press(event,false);}catch(e){}});
  elem.style.width=w+"vw";
  elem.style.height=h+"vw";
  elem.style.left=((100-w)/200)*window.innerWidth+"px";
  elem.style.top=Math.abs(window.innerHeight/2-(h/200)*window.innerWidth)+"px";
  windows.push({
    xPos:[((100-w)/200)*window.innerWidth,0],
    yPos:[Math.abs(window.innerHeight/2-(h/200)*window.innerWidth),0],
    z:winCount-1,   //I'm not entirely sure why this works...
    sizeX:[w,100],
    sizeY:[h,(window.innerHeight/window.innerWidth)*100-3],
    edit:0,
    collapsed:false
  });
  
  //set default taskbar icons to active instead of adding another icon
  var no=isStickied(id);
  if (no!=-1){
    var icon=document.getElementsByClassName("taskbaricon")[no];
    if (icon.getAttribute("id")=="null"){
      icon.id=winCount;
      icon.setAttribute("type",taskArr[no]);
      icon.setAttribute("activelevel",2);
      icon.setAttribute("onclick","minWin("+winCount+")");
      moveToTop(winCount);
      if (id!=0){delayIframe(winCount,tmpUrl);}
      winCount++;
      return;
    }
  }
  addTaskbarIcon(id,winCount,2,data.name,data.icon,false);
  moveToTop(winCount);
  if (id!=0){delayIframe(winCount,tmpUrl);}
  winCount++;
}
             
function delayIframe(id,src){
  setTimeout(function(){
    var iframe=document.getElementsByClassName("content")[id];
    iframe.src=src;
    iframe.onload=function(){
      document.getElementsByClassName("loadingoverlay")[id].style="opacity: 0; background-color:transparent";
    }
  },500);
}

function addTaskbarIcon(id,count,actLvl,name,icon,stickied){
  var elems=document.getElementsByClassName("taskbaricon");
  var iconEl=document.createElement("div");
  iconEl.setAttribute("class","taskbaricon borderCol");
  iconEl.setAttribute("id",count);
  iconEl.setAttribute("type",id);
  iconEl.setAttribute("activelevel",actLvl);
  iconEl.setAttribute("title",name);
  iconEl.setAttribute("onclick",stickied?"selectIcon(event,"+id+",true)":"minWin("+count+")");
  iconEl.innerHTML="<div class=\"smallicon\" style=\"background-image:url(https://picturelements.github.io/images/win_icons/"+icon+".png);\"></div>";
  iconEl.addEventListener("mousedown",function(event){showContext(event,1)});
  if (elems.length<taskArr.length||!stickied){
    document.getElementById("taskbar").appendChild(iconEl);
  }else{
    document.getElementById("taskbar").insertBefore(iconEl,elems[taskArr.length]);
  }
}

function isStickied(id){
  for (var i=0;i<taskArr.length;i++){
    if (taskArr[i]==id){return i;}
  }
  return -1;
}

function press(evt,rez){
  if (evt.target.parentElement.getAttribute("type")!="settings"){document.getElementById("clockbar").style.display="none";}
  var id=rez?evt.target.parentElement.getElementsByClassName("infobar")[0].id:evt.target.id;
  selWin=id;
  xStart=evt.clientX;
  yStart=evt.clientY;
  document.getElementsByClassName("content")[id].style.pointerEvents="none";
  moveToTop(id);
  resize=rez;
  if (resize){
    attr=evt.target.getAttribute("scale");
  }
  select=false;
  clicked=true;
  hideSearch();
  hideContext();
  evt.stopPropagation();
}

function release(event){
  if (clicked&&!preventEvents){
    var edit=windows[selWin].edit;
    if (resize){
      var mult=attr.includes("l")?-1:1;
      if (attr.includes("w")){windows[selWin].sizeX[edit]=Math.max(windows[selWin].sizeX[edit]+((event.clientX-xStart)*mult/window.innerWidth*100),20);}
      if (attr.includes("h")){windows[selWin].sizeY[edit]=Math.max(windows[selWin].sizeY[edit]+((event.clientY-yStart)/window.innerWidth*100),15);}
      if (mult==-1){
        windows[selWin].xPos[edit]+=(evt.clientX-xStart);
      }
    }else{
      if (setFullscreen>0){
        edit=(setFullscreen==1?1:0);
        windows[selWin].edit=edit;
        windows[selWin].xPos[edit]=setFullscreen<3?0:window.innerWidth/2;
        windows[selWin].yPos[edit]=0;
        windows[selWin].sizeX[edit]=(setFullscreen==1?100:50);
        windows[selWin].sizeY[edit]=window.innerHeight/window.innerWidth*100-3;
        var elem=document.getElementsByClassName("window")[selWin].style;
        elem.left=setFullscreen<3?0:"50vw";
        elem.top=0;
        elem.width=setFullscreen==1?"100vw":"50vw";
        elem.height=windows[selWin].sizeY[edit]+"vw";
        elem.transition="100ms";
        setTimeout(function(){elem.transition="none";},100);
        document.getElementById("shadow").style.opacity=0;
        setFullscreen=0;
      }else{
        windows[selWin].xPos[edit]+=(event.clientX-xStart);
        windows[selWin].yPos[edit]+=(event.clientY-yStart);
      }
    }
    clicked=false;
    document.getElementsByClassName("content")[selWin].style.pointerEvents="auto";
  }
  select=false;
  document.getElementById("selectbox").style="display:none";
}

function moveWindow(evt){
  if (clicked&&!preventEvents){
    var elem=document.getElementsByClassName("window")[selWin];
    var sW=windows[selWin];
    if (resize){
      var mult=attr.includes("l")?-1:1;
      if (attr.includes("w")){elem.style.width=(sW.sizeX[sW.edit]+(evt.clientX-xStart)/window.innerWidth*100*mult)+"vw";}
      if (attr.includes("h")){elem.style.height=(sW.sizeY[sW.edit]+(evt.clientY-yStart)/window.innerWidth*100)+"vw";}
      if (mult==-1){    //&&parseInt(elem.style.width.replace("vw"))>=20
        elem.style.left=(sW.xPos[sW.edit]+evt.clientX-xStart)+"px";
      }
    }else{
      elem.style.left=(sW.xPos[sW.edit]+evt.clientX-xStart)+"px";
      elem.style.top=(sW.yPos[sW.edit]+evt.clientY-yStart)+"px";
      if (elem.getAttribute("type")!="error"&&elem.getAttribute("type")!="settings"){
        if (sW.edit==1&&sW.xPos[sW.edit]==0&&sW.sizeX[sW.edit]==100&&evt.clientY-yStart>=window.innerHeight/100){
          sW.edit=0;
          var sPerc=evt.clientX/window.innerWidth;
          var el=document.getElementsByClassName("window")[selWin];
          el.style.width=sW.sizeX[0]+"vw";
          el.style.height=sW.sizeY[0]+"vw";
          sW.xPos[0]=evt.clientX-(sW.sizeX[0]/100*window.innerWidth)*sPerc;
          sW.yPos[0]=evt.clientY-0.0125*window.innerWidth;
          el.style.left=sW.xPos[0]+"px";
          el.style.top=sW.yPos[0]+"px";
          el.style.transition="50ms";
          setTimeout(function(){el.style.transition="none";},50);
        }else if (evt.clientY<=window.innerWidth/100){
          document.getElementById("shadow").style="opacity:1; width:100%; left:0";
          setFullscreen=1;
        }else if (evt.clientX<=window.innerWidth/100){
          document.getElementById("shadow").style="opacity:1; width:50%; left:0";
          setFullscreen=2;
        }else if (evt.clientX>=window.innerWidth/100*99){
          document.getElementById("shadow").style="opacity:1; width:50%; left:50%";
          setFullscreen=3;
        }else{
          document.getElementById("shadow").style.opacity="0";
          setFullscreen=0;
        }
      }
    } 
  }else if (select&&!preventEvents){
    var w=Math.abs(evt.clientX-xStart),h=Math.abs(evt.clientY-yStart);
    var x=(evt.clientX-xStart>0)?xStart:evt.clientX,y=(evt.clientY-yStart>0)?yStart:evt.clientY;
    document.getElementById("selectbox").style="display:block; left:"+x+"px; top:"+y+"px; width:"+w+"px; height:"+h+"px";
    
    var elem=document.getElementsByClassName("desktoplink");
    var iconData=[];
    var iW=window.innerWidth*0.05,iH=window.innerWidth*0.06;
    for (var i=0;i<elem.length;i++){
      elem[i].setAttribute("selected",false);
      var rect=elem[i].getBoundingClientRect();
      iconData.push({
        x: rect.left,
        y: rect.top
      });
    }
    //document.getElementById("test").innerHTML=x+","+y+","+w+","+h;
    for (var h2=0;h2<=30;h2++){
      for (var w2=0;w2<=30;w2++){
        var x2=x+w/30*w2,y2=y+h/30*h2;
        for (var i=0;i<elem.length;i++){
          if (x2>=iconData[i].x&&x2<=iconData[i].x+iW&&y2>=iconData[i].y&&y2<=iconData[i].y+iH){
            elem[i].setAttribute("selected",true);
          }
        }
      }
    }
  }
}

function closeWin(id){
  actWin=document.getElementsByClassName("window")[id];
  actWin.style.display="none";
  /*var wins=document.getElementsByClassName("window");
  var actWin=null;
  for (var i=0;i<wins.length;i++){
    if (wins[i].id==id){
      actWin=wins[i];
      windows.splice(i,1);
    }
  }*/
  actWin.getElementsByTagName("iframe")[0].src="";
  var set=document.getElementById("errcontent");
  if (set!=null&&actWin.getAttribute("type")=="settings"){
    actWin.setAttribute("type","was_settings");
    set.parentElement.removeChild(set);
  }
  var icons=document.getElementsByClassName("taskbaricon");
  for (var i=0;i<icons.length;i++){
    if (icons[i].id==id){
      if (isStickied(icons[i].getAttribute("type"))!=-1&&i<taskArr.length){
        icons[i].id="null";
        icons[i].setAttribute("activelevel",0);
        icons[i].setAttribute("onclick","selectIcon(event,"+icons[i].getAttribute("type")+",true)");
        for (var n=i+1;n<icons.length;n++){
          if (icons[n].getAttribute("type")==icons[i].getAttribute("type")){
            icons[i].id=icons[n].id;
            icons[n].id="null";
            icons[n].setAttribute("type","null");
            icons[n].style.opacity="0";
            //setTimeout(function(){icons[n].style.display="none"; findTopWin();},200);
            icons[i].setAttribute("onclick","minWin("+icons[i].id+")");
            setTimeout(function(){icons[n].parentElement.removeChild(icons[n]); findTopWin();},200);
            clicked=false;
            return;
          }
        }
      }else{
        icons[i].style.opacity="0";
        setTimeout(function(){icons[i].parentElement.removeChild(icons[i]); findTopWin();},200);
        clicked=false;
        return;
      }
    }
  }
  //actWin.parentElement.removeChild(actWin);
  findTopWin();
  clicked=false;
  select=false;
}

function reloadWin(id){
  var srcEl=document.getElementsByTagName("iframe")[id];
  var src=srcEl.src;
  srcEl.src=src;
  clicked=false;
  select=false;
}

function toggle(id){
  windows[id].edit=Math.abs(windows[id].edit-1);
  var elem=document.getElementsByClassName("window")[id];
  var edit=windows[id].edit;
  elem.style.width=windows[id].sizeX[edit]+"vw";
  elem.style.height=windows[id].sizeY[edit]+"vw";
  elem.style.left=windows[id].xPos[edit]+"px";
  elem.style.top=windows[id].yPos[edit]+"px";
  moveToTop(id);
  findTopWin();
  elem.style.transition="100ms";
  setTimeout(function(){elem.style.transition="none";},100);
}

function minWin(id){
  if (document.getElementsByClassName("window")[id].getAttribute("active")=="true"||windows[id].collapsed){
    windows[id].collapsed=!windows[id].collapsed;
  }
  moveToTop(id);
  findTopWin();
}

function findTopWin(){
  var max=-10,maxId=-1;
  var wins=document.getElementsByClassName("window");
  for (var i=0;i<windows.length;i++){
    if (wins[i].style.display=="block"&&windows[i].z>max){
      max=windows[i].z;
      maxId=i;
    }
  }
  if (maxId>=0){wins[maxId].setAttribute("active",true);}
  elem=document.getElementsByClassName("taskbaricon");
  for (var i=0;i<elem.length;i++){
    if (elem[i].getAttribute("activelevel")==2){elem[i].setAttribute("activelevel",1);}
    if (elem[i].id==maxId){elem[i].setAttribute("activelevel",2);}
  }
}

function moveToTop(id){
  var max=0;
  var wins=document.getElementsByClassName("window");
  for (var i=0;i<windows.length;i++){
    if (windows[i].z>max){max=windows[i].z;}
    wins[i].setAttribute("active",false);
  }
  if (max!=windows[id].z){
    wins[id].style.zIndex=max+1;
    windows[id].z=max+1;
  }
  wins[id].setAttribute("active",true);
  
  var collapsed=windows[id].collapsed;
  var elem=document.getElementsByClassName("window")[id];
  elem.style.display=collapsed?"none":"block";
  elem=document.getElementsByClassName("taskbaricon");
  for (var i=0;i<elem.length;i++){
    elem[i].setAttribute("activelevel",elem[i].getAttribute("activelevel")==0?0:1);
    if (elem[i].id==id){
      elem[i].setAttribute("activelevel",(collapsed?1:2));
    }
  }
}

function selectIcon(evt,id,singleClick){
  hideSearch();
  if (!preventEvents){
    var time=new Date().getTime();
    if (Math.abs(evt.clientX-prevX)<5&&Math.abs(evt.clientY-prevY)<5||singleClick){
      if (time-last<300||singleClick||evt.target.getAttribute("class")!="ddesc"){
        addWindow(id,null,null,DEF_WIN_W,DEF_WIN_H);
        prevX=-100;
      }else{
        editName(id);
        preventEvents=true;
      }
    }else{
      prevX=evt.clientX;
      prevY=evt.clientY;
    }
    last=time;
  }
  document.getElementById("context").style.display="none";
}

function editName(id){
  var p=document.getElementsByClassName("ddesc")[id];
  var name=p.innerHTML;
  p.innerHTML="<textarea cols=\"9\" rows=\"2\" maxlength=\"18\" style=\"height:"+(name.length<10?0.9:1.8)+"vw\" id=\"nameedit\">"+name+"</textarea>";
  document.getElementById("nameedit").select();
  document.getElementById("nameedit").addEventListener("keydown",function(event){setName(event,id)});
  document.getElementById("nameedit").addEventListener("keyup",editSize);
}

function editSize(){
  var elem=document.getElementById("nameedit");
  elem.style.height=(elem.value.length>9?1.8:0.9)+"vw";
}

function setName(evt,id){
  var elem=document.getElementById("nameedit");
  if (evt.keyCode==13){
    var oldName=programData[id].name;
    var name=elem.value;
    for (var i=0;i<programData.length;i++){
      var boolName=(programData[i].name==name&&name!=oldName),boolBlank=(name=="");
      if (boolName||boolBlank){
        if (boolName){showError("Filename Error","Error: Filename \""+name+"\" is already in use. Try another name.");}
        if (boolBlank){showError("Filename Error","Error: Filename cannot be blank. Try another name.");}
        elem.parentElement.innerHTML=oldName;
        preventEvents=false;
        return;
      }
    }
    elem.parentElement.parentElement.title=name;
    elem.parentElement.innerHTML=name;
    preventEvents=false;
    programData[id].name=name;
    var titles=document.getElementsByClassName("wintitle");
    var icons=document.getElementsByClassName("taskbaricon");
    for (var i=0;i<titles.length;i++){
      if (titles[i].innerHTML==oldName){
        titles[i].innerHTML=name;
      }
    }
    for (var i=0;i<icons.length;i++){
      if (icons[i].title==oldName){
        icons[i].title=name;
      }
    }
    localStorage.setItem("customTitle"+id,name);
  }else if (evt.keyCode==8){
    elem.style.height=(elem.value.length<11?0.9:1.8)+"vw";
  }else{
    elem.style.height=(elem.value.length>8?1.8:0.9)+"vw";
  }
}

function resetNames(){
  var icons=document.getElementsByClassName("taskbaricon");
  var titles=document.getElementsByClassName("wintitle");
  var titles2=document.getElementsByClassName("ddesc");
  for (var i=0;i<titles.length;i++){
    for (var n=0;n<origNames.length;n++){
      if (titles[i].innerHTML==programData[n].name){titles[i].innerHTML=origNames[n];}
    }
  }
  for (var i=0;i<icons.length;i++){
    icons[i].title=origNames[i];
  }
  for (var i=0;i<titles2.length;i++){
    titles2[i].innerHTML=origNames[i];
    localStorage.setItem("customTitle"+i,origNames[i]);
  }
  for (var n=0;n<origNames.length;n++){
    programData[n].name=origNames[n];
  }
}

function showError(errtitle,errStr){
  addWindow(0,errtitle,errStr,25,9);
}

function showSearchFull(evt){
  if (document.getElementById("search").value==""){document.getElementById("innerbar").innerHTML=document.getElementById("resultsbuffer").innerHTML;}
  document.getElementById("searchbarbar").setAttribute("expanded",false);
  document.getElementById("sbblabel").innerHTML="<b>SEARCH</b>";
  document.getElementById("search").setAttribute("active",true);
  var search=document.getElementById("searchbar").style;
  search.width="27.5vw";
  search.height="50vw";
  var buttons=document.getElementsByClassName("sbbitem2");
  buttons[0].style.bottom="0";
  buttons[1].style.display="none";
  document.getElementsByClassName("sbbitem")[1].style.display="block";
  if (!expanded){
    showSearch(evt);
  }
  evt.stopPropagation();
}

function showSearch(evt){
  expanded=true;
  document.getElementById("searchbar").style.opacity="1";
  document.getElementById("searchbar").style.bottom="3vw";
  document.getElementById("context").style.display="none";
  document.getElementById("powerbar").style.display="none";
  evt.stopPropagation();
}

function showHome(evt){
  document.getElementById("searchbarbar").setAttribute("expanded",false);
  document.getElementById("innerbar").innerHTML="";
  document.getElementById("sbblabel").innerHTML="<b>HOME</b>";
  document.getElementById("search").setAttribute("active",false);
  var buttons=document.getElementsByClassName("sbbitem2");
  buttons[0].style.bottom="3.5vw";
  buttons[1].style.display="block";
  document.getElementsByClassName("sbbitem")[1].style.display="none";
  var elem=document.getElementById("searchbar").style;
  if (!expanded){
    showSearch(evt);
  }else if (elem.width=="57.5vw"){
    document.getElementById("searchbar").style="opacity:0; bottom:-100vh";
    expanded=false;
  }
  elem.width="57.5vw";
  elem.height="30vw";
  setTimeout(function(){
    document.getElementById("innerbar").innerHTML=document.getElementById("mainbuffer").innerHTML;
    fillHome();
    var pieces=document.getElementById("innerbar").getElementsByClassName("puzzle");
    for (var i=0;i<pieces.length;i++){
      pieces[i].addEventListener("mousedown",function(event){selectPiece(event);});
      pieces[i].addEventListener("mousemove",function(event){slidePiece(event);});
      pieces[i].addEventListener("mouseup",function(event){placePiece(event);});
    }
  },200);
  evt.stopPropagation();
}

function selectPiece(evt){
  var pieces=document.getElementById("innerbar").getElementsByClassName("puzzle");
  var sel=0,max=pieces.length-1;
  var preBox=document.getElementById("puzzlebar").getBoundingClientRect(),preBox2;
  for (var i=0;i<pieces.length;i++){
    if (pieces[i]==evt.target){sel=i;}
  }
  preBox2=pieces[sel].getBoundingClientRect();
  var box={
    t: preBox2.top-preBox.top,
    l: preBox2.left-preBox.left,
    w: preBox2.width,
    h: preBox2.height
  };
  pieces[sel].style.opacity="0.2";
  pieces[max].setAttribute("wide",pieces[sel].getAttribute("wide"));
  pieces[max].innerHTML=pieces[sel].innerHTML;
  var sh=document.getElementById("puzzlebar").scrollTop;
  pieces[max].style="display:block; position:absolute; margin-left:"+(evt.clientX-preBox.left-box.w/2)+"px; margin-top:"+(evt.clientY-preBox.top-box.h/2+sh)+"px";
  slide=true;
}

function slidePiece(evt){
  if (slide){
    var pieces=document.getElementById("innerbar").getElementsByClassName("puzzle");
    var count=0;
    for (var i=0;i<pieces.length-1;i++){
      count+=(pieces[i].getAttribute("wide")=="true"?2:1);
      if (count==5){
        count=0;
      }else if (count==6){
        var elem=document.createElement("div");
        elem.setAttribute("class","puzzle");
        elem.setAttribute("wide","false");
        elem.setAttribute("style","opacity:0");
        pieces[i].parentElement.insertBefore(elem,pieces[i]);
        count=0;
      }
    }
    var max=pieces.length-1;
    var container=document.getElementById("puzzlebar");
    var box=container.getBoundingClientRect();
    var sh=container.scrollTop;
    var box2=pieces[max].getBoundingClientRect();
    pieces[max].style="display:block; position:absolute; margin-left:"+(evt.clientX-box.left-box2.width/2)+"px; margin-top:"+(evt.clientY-box.top-box2.height/2+sh)+"px";
    var ghost;
    for (var i=0;i<max;i++){
      if (pieces[i].style.opacity=="0.2"){ghost=pieces[i]; break;}
    }
    
    for (var i=0;i<max;i++){
      var rect=pieces[i].getBoundingClientRect();
      if (evt.clientX>rect.left&&evt.clientY>rect.top&&evt.clientX<rect.left+Math.min(rect.width,ghost.getBoundingClientRect().width)&&evt.clientY<rect.top+rect.height&&pieces[i]!=ghost){
        var pe=ghost.parentElement;
        pe.removeChild(ghost);
        pe.insertBefore(ghost,pieces[i]);
        break;
      }
    }
    var tmpElem=document.getElementById("innerbar").getElementsByClassName("puzzle");
    for (var i=0;i<tmpElem.length-1;i++){
      if (tmpElem[i].style.opacity=="0"){
        if (tmpElem[i+1]!=ghost){
          tmpElem[i].parentElement.removeChild(tmpElem[i]);
        }
      }
    }
  }
}

function placePiece(){
  var pieces=document.getElementById("innerbar").getElementsByClassName("puzzle");
  for (var i=0;i<pieces.length-1;i++){
    if (pieces[i].style.opacity=="0.2"){pieces[i].style.opacity="1"; break;}
  }
  pieces[pieces.length-1].style.display="none";
  for (var i=0;i<pieces.length-1;i++){
    if (pieces[i].style.opacity=="0"){
      pieces[i].parentElement.removeChild(pieces[i]);
    }
  }
  slide=false;
}

function fillHome(){
  var output="";
  searchFor=-1;
  var locData=[];
  for (var i=1;i<programData.length;i++){
    locData.push(programData[i]);
    locData[i-1].index=i;
    locData[i-1].oftenUsed=oftenUsed[i];
  }
  for (var i=0;i<locData.length;i++){
    for (var j=i+1;j<locData.length;j++){
      if (locData[i].oftenUsed<locData[j].oftenUsed){
        var tmpR=locData[i];
        locData[i]=locData[j];
        locData[j]=tmpR;
      }
    }
  }
  
  if (locData[0].oftenUsed>0){
    output+="<div class=\"pbspacer\">Often used</div>";
    for (var i=0;i<6;i++){
      if (locData[i].oftenUsed==0){break;}
      output+="<div class=\"pbitem\" onclick=selectIcon(event,"+locData[i].index+",true)><div id=\"pbicon\" style=\"background-image:url(https://picturelements.github.io/images/win_icons/"+locData[i].icon+".png)\"></div><div id=\"pbtitle\">"+locData[i].name+" <span style=\"color:#666\">("+locData[i].oftenUsed+")</span></div></div>";
    }
    output+="<div class=\"pbspacer\"></div>";
  }
  
  for (var i=0;i<locData.length;i++){
    for (var j=i+1;j<locData.length;j++){
      if (locData[i].name.localeCompare(locData[j].name)>0){
        var tmpR=locData[i];
        locData[i]=locData[j];
        locData[j]=tmpR;
      }
    }
  }
  for (var i=0;i<locData.length;i++){
    var name=locData[i].name;
    var cc=name.charCodeAt(0);
    if (cc>=97&&cc<=122){cc-=32;}
    if (searchFor==-1){
      if (cc<65||cc>90){
        output+="<div class=\"pbspacer\">#</div>";
        searchFor=64;
      }
    }
    if (cc>searchFor&&cc>=65&&cc<=90){
      output+="<div class=\"pbspacer\">"+String.fromCharCode(cc)+"</div>";
      searchFor=cc;
    }
    output+="<div class=\"pbitem\" onclick=selectIcon(event,"+locData[i].index+",true)><div id=\"pbicon\" style=\"background-image:url(https://picturelements.github.io/images/win_icons/"+locData[i].icon+".png)\"></div><div id=\"pbtitle\">"+locData[i].name+"</div></div>";
  }
  document.getElementById("programbar").innerHTML=output;
}

function hideSearch(){
  expanded=false;
  var elem=document.getElementById("searchbar").style;
  elem.opacity="0";
  elem.bottom="-100vh";
  var elem=document.getElementById("search");
  elem.value="";
  elem.setAttribute("active",false);
}

function sbbToggle(elem){
  elem=elem.parentElement;
  elem.setAttribute("expanded",elem.getAttribute("expanded")=="false");
}

function sbbHome(){
  document.getElementById("searchbarbar").setAttribute("expanded",false);
  document.getElementById("search").value="";
  document.getElementById("innerbar").innerHTML=document.getElementById("resultsbuffer").innerHTML;
}

function togglePower(){
  var powerbar=document.getElementById("powerbar").style;
  powerbar.display=powerbar.display=="block"?"none":"block";
}

function restart(){
  var elem=document.getElementById("loadscreen");
  elem.innerHTML="";
  var inner="<p id=\"loadmsg\">Shutting down...</p><div id=\"loadercontainer\"><div id=\"loader\"></div><div id=\"loader2\"></div><div id=\"loader3\"></div>";
  elem.style="display:block; opacity:0; animation:fadescreen 3500ms forwards 1; animation-delay:250ms;";
  setTimeout(function(){elem.innerHTML=inner;},500);
  setTimeout(function(){elem.style.backgroundColor="black"; elem.innerHTML=""},3750);
  setTimeout(function(){location.reload();},4000);
}

function powerOff(){
  alert("POWER OFF");
}

function search(){
  var input=new RegExp(""+document.getElementById("search").value+"","gi");
  var results=[];
  for (var i=1;i<programData.length;i++){
    var arr=programData[i].keywords.split(",");
    var newArr=[];
    for (var n=0;n<arr.length;n++){
      if (arr[n].match(input)!=null||programData[i].name.match(input)!=null){
        newArr.push(arr[n]);
      }
    }
    if (newArr.length>0){
      var keyws=newArr.toString().replace(/,/g,", ");
      results.push({
        name: programData[i].name,
        keywords: keyws.match(input)==null?keyws:keyws.replace(input,"<span class=\"highlight\">"+keyws.match(input)[0]+"</span>"),
        url: programData[i].url,
        icon: "https://picturelements.github.io/images/win_icons/"+programData[i].icon+".png"
      });
    }
  }
  for (var i=0;i<results.length;i++){
    for (var j=i+1;j<results.length;j++){
      if (results[i].name.localeCompare(results[j].name)>0){
        var tmpR=results[i];
        results[i]=results[j];
        results[j]=tmpR;
      }
    }
  }
  var inHTML="";
  for (var i=0;i<results.length;i++){
    inHTML+="<a class=\"result\" href=\""+results[i].url+"\" taget=\"_blank\"><div class=\"resultimg\" style=\"background-image:url("+results[i].icon+")\"></div><div class=\"resulttext\">"+results[i].name+"<br><kw>"+results[i].keywords+"</kw></div></a>"
  }
  document.getElementById("innerresults").innerHTML=inHTML;
}

function showContext(evt,type){
  if (evt.which!=1){
    var items=document.getElementsByClassName("contextitem");
    var context=document.getElementById("context");
    for (var i=0;i<items.length;i++){
      items[i].style.display="none";
    }
    for (var i=0;i<contextAssort[type].length;i++){
      items[contextAssort[type][i]].style.display="block";
    }
    
    if (type==0){
      var tot=0;
      var id=-1,elem=document.getElementsByClassName("desktoplink");
      for (var i=1;i<elem.length;i++){
        if (elem[i]==evt.target&&id==-1){id=i;}
        if (elem[i].getAttribute("selected")=="true"){
          tot++;
        }
      }
      document.getElementsByClassName("contextitem")[1].style.display=tot>1&&id!=-1?"block":"none";
      document.getElementsByClassName("contextitem")[1].innerHTML="Open All ("+tot+")";
      context.setAttribute("target",id);
      for (var i=0;i<elem.length;i++){
        if (elem[i]==evt.target){
          context.setAttribute("targetIndex",i);
        }
      }
    }else if (type==1){
      var icons=document.getElementsByClassName("taskbaricon");
      for (var i=0;i<icons.length;i++){
        if (evt.target==icons[i]){
          items[i<taskArr.length?4:5].style.display="none";
          items[6].innerHTML="Open "+(i<taskArr.length&&icons[i].getAttribute("activelevel")==0?"":"new");
          items[7].style.display=icons[i].id=="null"?"none":"block";
        }
      }
      context.setAttribute("target",evt.target.getAttribute("type"));
      for (var i=0;i<icons.length;i++){
        if (icons[i]==evt.target){
          context.setAttribute("targetIndex",i);
        }
      }
    }else if (type==2){
      if (!document.fullscreenElement&&!document.mozFullScreenElement&&!document.webkitFullscreenElement&&!document.msFullscreenElement){
        items[8].innerHTML="Go fullscreen";
      }else{
        items[8].innerHTML="Exit fullscreen";
      }
      items[9].innerHTML=(contextShow?"Disable":"Enable")+" context menu";
    }
    context.style.display="block";
    context.style.left=(evt.clientX+2)+"px";
    context.style.top=((evt.clientY+context.offsetHeight<window.innerHeight-window.innerWidth*0.03)?(evt.clientY+2):(evt.clientY-context.offsetHeight-2))+"px";
    evt.stopPropagation();
  }
}

function contextOpen(evt,mult){
  if (!mult){
    var elem=document.getElementById("context");
    addWindow(elem.getAttribute("target"),null,null,DEF_WIN_W,DEF_WIN_H);
    elem.style.display="none";
  }else{
    var count=0,ids=[];
    var elem=document.getElementsByClassName("desktoplink");
    for (var i=1;i<elem.length;i++){
      if (elem[i].getAttribute("selected")=="true"){
        ids.push(i);
        setTimeout(function(){addWindow(ids[0],null,null,DEF_WIN_W,DEF_WIN_H); ids.splice(0,1);},750*count);
        count++;
      }
    }
    document.getElementById("context").style.display="none";
  }
  evt.stopPropagation();
}

function contextClose(){
  document.getElementById("context").style.display="none";
  var toClose=document.getElementsByClassName("taskbaricon")[document.getElementById("context").getAttribute("targetIndex")].id;
  closeWin(toClose);
}

function contextEdit(evt){
  var elem=document.getElementById("context");
  editName(elem.getAttribute("target"));
  preventEvents=true;
  elem.style.display="none";
}

function contextPin(type){
  document.getElementById("context").style.display="none";
  var id=document.getElementById("context").getAttribute("target");
  var index=document.getElementById("context").getAttribute("targetIndex");
  for (var i=0;i<taskArr.length;i++){
    if (id==taskArr[i]){return;}
  }
  if (type==0){addTaskbarIcon(id,"null",0,programData[id].name,programData[id].icon,true);}
  else if (index>taskArr.length){
    var icon=document.getElementsByClassName("taskbaricon")[index];
    icon.style.opacity="0";;
    icon.parentElement.removeChild(icon);
    document.getElementById("taskbar").insertBefore(icon,document.getElementsByClassName("taskbaricon")[taskArr.length]);
    icon.style.opacity="1";
  }
  taskArr.push(id);
  localStorage.setItem("taskArr",taskArr);
}

function contextUnpin(){
  document.getElementById("context").style.display="none";
  var icons=document.getElementsByClassName("taskbaricon");
  var target=document.getElementById("context").getAttribute("target");
  for (var i=0;i<icons.length;i++){
    if (icons[i].getAttribute("type")==target){
      var id=icons[i].id;
      if (id=="null"){
        icons[i].style.opacity="0";
        //setTimeout(function(){icons[i].style.display="none";},200);
        setTimeout(function(){icons[i].parentElement.removeChild(icons[i]);},200);
      }else{
        closeWin(id);
      }
      taskArr.splice(i,1);
      break;
    }
  }
  localStorage.setItem("taskArr",taskArr);
}

function contextAddWin(evt){
  document.getElementById("context").style.display="none";
  var target=document.getElementById("context").getAttribute("target");
  selectIcon(evt,target,true);
}

function openSettings(scrTo){
  hideSearch();
  addWindow(0,"Settings",null,60,35);
  var dt=new Date();
  var date=new Date(dt.setTime(dt.getTime()+tzOffset*60000));
  var month=date.getMonth()+1,day=date.getDate();
  document.getElementById("dateset").value=date.getFullYear()+"-"+(month<10?"0"+month:month)+"-"+(day<10?"0"+day:day);
  document.getElementById("timezone").selectedIndex=tzIndex;
  var prec=document.getElementById("prectz");
  if (tzIndex==1&&prec.getAttribute("disabled")!=null){
    prec.removeAttribute("disabled");
    prec.value=tzOffset;
  }
  newTime();
  document.getElementsByClassName("sizeslider")[0].value=DEF_WIN_W;
  document.getElementsByClassName("sizeslider")[1].value=DEF_WIN_H;
  updateSize(0);
  colorSelect();
  if (scrTo!=null){
    document.getElementById("errcontent").scrollTop=document.getElementById(scrTo).offsetTop;
  }
}

function colorSelect(){
  var inner="";
  for (var i=0;i<colors.length;i++){
    inner+="<div class='coloroption' "+(i==colId?"selected":"")+" onclick=selCol("+i+")><div class='col' style='background-color:"+colors[i][0]+"'></div><div class='col' style='background-color:"+colors[i][1]+"'></div><div class='col' style='background-color:"+colors[i][2]+"'></div></div>";
  }
  document.getElementById("colorbar").innerHTML=inner;
  
  inner="<div class='backoption grad' "+(backId==0?"selected":"")+" onclick=selIco(0)></div>";
  for (var i=1;i<backgrounds.length+1;i++){
    inner+="<div class='backoption' "+(i==backId?"selected":"")+" onclick=selIco("+i+") style='background-image:url(https://picturelements.github.io/images/wallpapers/icons/"+(backgrounds[i-1].replace(".","Ico."))+")'></div>";
  }
  document.getElementById("backbar").innerHTML=inner;
}

function selCol(id){
  colId=id;
  localStorage.setItem("colId",id);
  colorSelect();
  setCols();
}

function selIco(id){
  backId=id;
  localStorage.setItem("backId",id);
  colorSelect();
  setCols();
}

function toggleClock(){
  var elem=document.getElementById("clockbar");
  if (elem.style.display=="none"){openClock();}
  else{elem.style.display="none";}
}

function openClock(){
  document.getElementById("clockbar").style.display="block";
  var dt=new Date((new Date().getTime())+tzOffset*60000);
  var year=dt.getFullYear(),dInMo=daysInMonth(dt.getMonth(),year);
  var elem=document.getElementById("calendar");
  elem.style.top="2.75vw";
  var tCo="<th>MON</th><th>TUE</th><th>WED</th><th>THU</th><th>FRI</th><th>SAT</th><th>SUN</th>";
  var startAt=(7+new Date(year,dt.getMonth(),1).getDay()-1)%7;
  var counter=-startAt+1;
  for (var i=0;i<6;i++){
    if (counter>dInMo){elem.style.top="3.25vw"; break;}
    tCo+="<tr>";
    for (var n=0;n<7;n++){
      if (counter<1){
        tCo+="<td inactive>"+(daysInMonth((12+dt.getMonth()-1)%12,year)+counter)+"</td>";
      }else if (counter<=dInMo){
        tCo+="<td "+(counter==dt.getDate()?"today":"")+">"+counter+"</td>"
      }else{
        tCo+="<td inactive>"+(counter-dInMo)+"</td>"
      }
      counter++;
    }
    tCo+="</tr>";
  }
  document.getElementById("calendar").innerHTML=tCo;
  //alert(daysInMonth(1,2017));
}

function daysInMonth(month,year) {
  return new Date(year,month+1,0).getDate();
}

backdrop.add("circles","#desktopwrapper");
backdrop.multiData("circles",{ 
  color: "rgba(255,255,255,0.05)",
  circleNo: 100,
  minSize: 5,
  maxSize: 30
});
backdrop.addCSS("-webkit-filter:blur(1px)");
backdrop.start(10);

window.onresize=function(){
  rez();
}

function rez(){
  backdrop.resize();
  document.getElementById("context").style.display="none";
  if (window.innerWidth/window.innerHeight<16/9){
    document.getElementById("desktopwrapper").style.backgroundSize="177vh 100vh";
  }else{
    document.getElementById("desktopwrapper").style.backgroundSize="100vw 56.25vw";
  }
}

function newTime(){
  var dt=new Date();
  dt.setTime(dt.getTime()+tzOffset*60000);
  var month=dt.getMonth()+1,day=dt.getDate(),hour=dt.getHours(),minute=dt.getMinutes();
  document.getElementById("time").innerHTML=""+(hour<10?"0"+hour:hour)+":"+(minute<10?"0"+minute:minute)+"<br>"+dt.getFullYear()+"-"+(month<10?"0"+month:month)+"-"+(day<10?"0"+day:day);
  
  var months=["January","February","March","April","May","June","July","August","September","October","November","December"];
  var suffix="th";
  if (day<10||day>20){
    if (day%10==1){suffix="st";}
    else if (day%10==2){suffix="nd";}
    else if (day%10==3){suffix="rd";}
  }
  var dateStr=months[dt.getMonth()]+" "+day+""+suffix+" "+dt.getFullYear();
  document.getElementById("clocklbl").innerHTML=dateStr;
  document.getElementById("time").title=dateStr;
  document.getElementById("hour").style="transform:rotate("+(hour/12*360+minute/2)+"deg)";
  document.getElementById("minute").style="transform:rotate("+(minute*6+dt.getSeconds()/10)+"deg)";
  document.getElementById("second").style="transform:rotate("+dt.getSeconds()*6+"deg)";
  
  var index=document.getElementById("timezone").selectedIndex;
  var offset=getOffset(dt,index);
  if (index>0){
    dt=new Date();
    dt.setTime(index==1?dt.getTime()+(document.getElementById("prectz").value)*60000+offset:dt.getTime()+((index-16+dt.getTimezoneOffset()/60)*60)*60000+offset);
  }else{
    dt=new Date();
    dt.setTime(dt.getTime()+offset);
  }
  document.getElementById("tzlbl").innerHTML="Current time: "+dt.toLocaleString()+"";
}

function getOffset(){
  var dt=new Date();
  var dt2=new Date(),roundedDate=Math.floor((dt.getTime()-60000*dt2.getTimezoneOffset())/unix24Hrs)*unix24Hrs;
  return new Date(document.getElementById("dateset").value).getTime()-roundedDate;
}

function setTime(){
  var dt=new Date();
  var offset=getOffset()/60000;
  var index=document.getElementById("timezone").selectedIndex;
  
  if (index==0){tzOffset=offset;}
  else if (index==1){tzOffset=parseInt(document.getElementById("prectz").value)+offset;}
  else{tzOffset=(index-16+dt.getTimezoneOffset()/60)*60+offset;}
  
  newTime();
  localStorage.setItem("tzIndex",index);
  localStorage.setItem("tzOffset",tzOffset);
  openClock();
}

function updateTime(){
  var index=document.getElementById("timezone").selectedIndex;
  var precTZ=document.getElementById("prectz");
  if (index==1){
    precTZ.removeAttribute("disabled");
  }else{
    precTZ.setAttribute("disabled","");
  }
  tzIndex=index;
  newTime();
}

function updateSize(id){
  var val=parseInt(document.getElementsByClassName("sizeslider")[id].value);
  if (id==0){DEF_WIN_W=val;}
  else{DEF_WIN_H=val;}
  document.getElementById("winW").innerHTML="Window width: "+DEF_WIN_W;
  document.getElementById("winH").innerHTML="Window height: "+DEF_WIN_H;
  localStorage.setItem("winW",DEF_WIN_W);
  localStorage.setItem("winH",DEF_WIN_H);
}

newTime();
setInterval(newTime,1000);
window.onload=function(){
  setTimeout(function(){
    document.getElementById("loadscreen").style.opacity=0;
    setTimeout(function(){document.getElementById("loadscreen").style.display="none";},500);
  },3500);
};
/*setInterval(function(){
  document.getElementById("test").innerHTML=prevX+" - "+prevY;
},10);*/

function toggleFullscreen() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}
