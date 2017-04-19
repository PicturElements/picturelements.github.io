var telluneData={
  r:30,
  delay:100,
  html:"<span class='audiocontainer'></span><svg class='sector first' width='100' height='100' viewBox='0 0 100 100'><path class='path first'></path></svg><svg class='sector second' width='100' height='100' viewBox='0 0 100 100'><path class='path second'></path></svg><svg class='circlesvg' width='100' height='100' viewBox='0 0 100 100'><line class='line' x1='50' y1='50'></line><line class='circle' r='2'></line></svg><div class='button'><div class='playstate'><svg width='100' height='100' viewBox='0 0 100 100'><polygon class='showonpause' points='20,10,90,50,20,90'></polygon><rect class='showonplay' x='10' y='10' width='30' height='80'></rect><rect class='showonplay' x='60' y='10' width='30' height='80'></rect><g class='loader showonload'><circle cx='30' cy='30' r='10'></circle><circle cx='70' cy='70' r='10'></circle></g></svg></div><div class='volumebox'><div class='volumewrapper'></div></div><div class='bottomcontent'><div class='infowrapper'><div class='counter'>00:00</div><div class='counter'>--:--</div></div><div class='infowrapper playlistcounter'><div class='counterwrapper'><span class='skipbtn' jump='-1'>&lt;</span><span class='counter'></span></div><div class='counterwrapper'><span class='counter'></span><span class='skipbtn' jump='1'>&gt;</span></div></div></div></div>"
}

function Tellune(parent,scale,src){
  var thread=null,sounds=[];
  var dur=0,rad=0,index=0;

  //bools
  var playing=false,linked=true,moved=false,loop=true;

  //elements
  var main=document.createElement("div");
  main.className="buttonwrapper linked paused loading";
  main.innerHTML=telluneData.html;
  parent.appendChild(main);
  main.style.fontSize=scale;
  
  var audiocontainer=main.getElementsByClassName("audiocontainer")[0];
  for (var i=2;i<arguments.length;i++){
    if (Array.isArray(arguments[i])){
      for (var n in arguments[i]){
        sounds.push(addAudio(arguments[i][n]));
      }
    }else{
      sounds.push(addAudio(arguments[i]));
    }
  }
  
  for (var i in sounds){
    sounds[i].addEventListener("ended",ended);
    sounds[i].addEventListener("waiting",function(){main.classList.add("loading");});
    sounds[i].addEventListener("canplay",function(){main.classList.remove("loading");});
  }
  
  var sound=sounds[0];
  var sector=main.getElementsByClassName("sector")[0];
  var counters=main.getElementsByClassName("counter");
  var circle=main.getElementsByClassName("circle")[0];
  var paths=main.getElementsByClassName("path");
  var line=main.getElementsByClassName("line")[0];
  
  if (sounds.length>1){
    main.classList.add("playlist");
    setProgress();
  }
  
  //lots of events and event handlers
  sound.onloadedmetadata=function(){
    setDur();
  };
  circle.addEventListener("mousedown",down);
  parent.addEventListener("mousemove",function(event){move(event);});
  parent.addEventListener("mouseup",up);
  circle.addEventListener("touchstart",function(){
    down();
  });
  parent.addEventListener("touchmove",function(event){
    move(event);
    if (!linked){event.preventDefault();}
  });
  parent.addEventListener("touchend",function(){
    up();
  });
  main.getElementsByClassName("button")[0].addEventListener("click",function(event){relayButtonAction(event);});
  main.getElementsByClassName("volumewrapper")[0].addEventListener("click",function(event){event.stopPropagation();});
  main.getElementsByClassName("volumewrapper")[0].addEventListener("mouseup",function(event){setVolume(event);});

  function down(){
    linked=false;
    moved=false;
    plotSector(paths[1],sound.currentTime/dur);
    replace("linked","unlinked");
  }

  function move(evt){
    if (!linked){
      var rect=parent.getBoundingClientRect();
      var x=evt.clientX || evt.touches[0].clientX;
      var y=evt.clientY || evt.touches[0].clientY;
      var dx=x-(rect.left+rect.width/2),dy=y-(rect.top+rect.height/2);
      rad=Math.atan(dy/dx)+Math.PI/2;
      if(dx<0){rad+=Math.PI;}
      var perc=rad/(Math.PI*2);
      plotSector(paths[1],perc);
      counters[0].innerHTML=toTimeString(perc*dur);
      moved=true;
    }
  }

  function up(){
    if (!linked&&moved){
      var perc=rad/(Math.PI*2);
      sound.currentTime=perc*dur;
      plotSector(paths[0],perc);
      plotSector(paths[1],perc);
    }
    linked=true;
    replace("unlinked","linked");
    main.classList.remove("lock_view");
  }
  
  function ended(){
    clearInterval(thread);
    playing=false;
    replace("playing","paused");
    plotSector(paths[0],1);
    setTimeout(function(){
      sector.classList.remove("shrink");
      plotSector(paths[0],0);
      jumpPlaylist(1);
      initSound();
    },300);
    sector.classList.add("shrink");
  }

  //the kinky stuff...
  function plotSector(elem,perc){
    var rad=2*Math.PI*perc,r=telluneData.r;
    if (perc>=1){
      elem.setAttribute("d","M50 50 v-30 A30 30 0 1 1 49.999 20");
    }else{
      elem.setAttribute("d","M50 50 v-30 A30 30 0 "+(perc<0.5?0:1)+" 1 "+(50+Math.sin(rad)*r)+" "+(50-Math.cos(rad)*r)+"");
    }
    if (elem==paths[1]||linked){
      var x=(50+Math.sin(rad)*r*1.4),y=(50-Math.cos(rad)*r*1.4);
      line.setAttribute("x2",x);
      line.setAttribute("y2",y);
      circle.setAttribute("x1",x);
      circle.setAttribute("y1",y);
      circle.setAttribute("x2",x);
      circle.setAttribute("y2",y);
    }
  }

  function plotSVG(){
    var perc=sound.currentTime/dur;
    plotSector(paths[0],perc);
    if (linked){counters[0].innerHTML=toTimeString(sound.currentTime);}
  }
  
  function relayButtonAction(evt){
    if (evt.target.className=="skipbtn"){
      sound.pause();
      jumpPlaylist(parseInt(evt.target.getAttribute("jump")));
      initSound();
    }else{
      togglePlay();
    }
  }

  function togglePlay(){
    if (sound.readyState<3){main.classList.add("loading");}
    if (!playing){
      sound.play();
      thread=setInterval(plotSVG,telluneData.delay);
    }else{
      sound.pause();
      clearInterval(thread);
    }
    toggle("playing","paused");
    playing=!playing;
  }

  function setVolume(evt){
    var perc=evt.target.getAttribute("volume");
    var bars=main.getElementsByClassName("volumebar");
    for (var i in bars){
      bars[i].className="volumebar";
    }
    evt.target.classList.add("selected");
    for (var i in sounds){
      sounds[i].volume=perc*perc;
    }
    evt.stopPropagation();
  }
  
  //meta stuff
  function toggle(cn,cn2){
    var cl=main.classList;
    if (cl.contains(cn)){
      cl.remove(cn);
      cl.add(cn2);
    }else if(cl.contains(cn2)){
      cl.remove(cn2);
      cl.add(cn);
    }
  }

  function replace(from,to){
    var cl=main.classList;
    if (cl.contains(from)){
      cl.remove(from);
      cl.add(to);
    }
  }

  function createVolume(){
    var parent=main.getElementsByClassName("volumewrapper")[0];
    for (var i=0;i<20;i++){
      var bar=document.createElement("div");
      bar.className="volumebar";
      bar.setAttribute("volume",(i+1)/20);
      parent.appendChild(bar);
    }
  }
  
  function addAudio(inp){
    var elem;
    if (typeof inp=="string"){
      var audio=document.createElement("audio");
      audio.src=inp;
      audiocontainer.appendChild(audio);
      elem=audio;
    }else{
      elem=inp;
    }
    return elem;
  }
  
  function jumpPlaylist(steps){
    var len=sounds.length;
    index=(len+index+(steps%len))%len;
  }
  
  function initSound(){
    sound=sounds[index];
    sound.currentTime=0;
    sound.play();
    if (sound.readyState>0){
      main.classList.add("loading");
      playFromStart();
    }else{
      sound.addEventListener("loadedmetadata",function(event){
        playFromStart();
      });
    }
  }
  
  function playFromStart(){
    setDur();
    setProgress();
    replace("paused","playing");
    main.classList.remove("loading");
    clearInterval(thread);
    thread=setInterval(plotSVG,telluneData.delay);
    playing=true;
  }
  
  function setDur(){
    dur=sounds[index].duration;
    telluneData.delay=Math.min(dur/1.5,500);
    counters[1].innerHTML=toTimeString(dur);
  }
  
  function setProgress(){
    counters[2].innerHTML=(index+1);
    counters[3].innerHTML=sounds.length;
  }

  createVolume();
  plotSector(paths[0],0);
  plotSector(paths[1],0);
}

function toTimeString(duration){
  duration=Math.round(duration);
  var res="";
  if (duration>=3600){
    res+=Math.floor(duration/3600)+":";
    duration%=3600;
  }
  res+=fillZeroes(Math.floor(duration/60))+":";
  duration%=60;
  res+=fillZeroes(duration);
  return res;
}

function fillZeroes(num){
  if (num>=10){return num;}
  if (num>0){return "0"+num;}
  return "00";
}
