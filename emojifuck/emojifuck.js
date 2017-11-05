var data=[0],runData=[];
var pointer=0,runPointer=0,inpPointer=0;
var input,iters=0,runs=0;
var outElem,msgElem,bar,time,thread=null,timeout=null;
var showEmoji=true,live=true,scroll=true,comp=false,tour=false,edited=false,speedy=false,running=false;
var openName=null;

var ops=["incp","decp","inc","dec","putchar","getchar","cond","break","comment","speed","quit","pause"];
var origKeys=['>','<','+','-','.',',','[',']','|','~','$','%'];
var keys=[56393,56392,56834,56881,56396,56495,56908,56911,56443,56613,56489,56400];
var emoji=['👉','👈','😂','😱','👌','💯','🙌','🙏','👻','🔥','💩','👐'];

var buttons=document.getElementsByClassName("emojibutton");
var numinputs=document.querySelectorAll("input[data-name]");
var opsquares,memsquares,memlen=16*6;
var infield=document.getElementById("datain");
var bf=new Brainfuck();

var uservars={
  maxiter:10000,
  throttle:10,
  maxmem:1000
};
var autosave=[],projects=JSON.parse(localStorage.getItem("projects")) || {};
loadDefault();

for (var i=0;i<buttons.length;i++){
  buttons[i].addEventListener("click",function(event){
    clickButton(event);
  });
  buttons[i].setAttribute("data-emoji",emoji[i]);
  buttons[i].setAttribute("data-index",i);
}
for (var i=0;i<numinputs.length;i++){
  numinputs[i].addEventListener("input",function(event){updateUserVars(event);});
  numinputs[i].addEventListener("keyup",function(event){updateUserVars(event);});
}
infield.addEventListener("keydown",function(event){
  clearTimeout(timeout);
  timeout=setTimeout(function(){saveLog(true);},1000);
  if (event.keyCode==9){
    if (event.shiftKey){
      addChar("",true);
      infield.selectionStart--;
      infield.selectionEnd--;
    }else{
      addChar("\t");
    }
    event.preventDefault();
  }else{
    setTimeout(function(){
      if (!showEmoji){return;}
      var selStart=infield.selectionStart;
      var char=infield.value[selStart-1];
      for (var i in origKeys){
        if (char==origKeys[i]){
          infield.value=asciiToEmoji();
          infield.selectionStart=selStart+1;
          infield.selectionEnd=selStart+1;
          break;
        }
      }
      //infield.value=showEmoji?asciiToEmoji():emojiToAscii();
      /*if (event.ctrlKey&&event.keyCode==86){
        infield.value=showEmoji?asciiToEmoji():emojiToAscii();
        return;
      }
      if (!showEmoji){return;}
      var char=infield.value[infield.selectionStart-1];
      for (var i in origKeys){
        if (char==origKeys[i]){
          addChar(emoji[i],true);
        }
      }*/
    },0);
  }
});
infield.addEventListener("paste",function(event){
  setTimeout(function(){
    var selStart=infield.selectionStart;
    infield.value=showEmoji?asciiToEmoji():emojiToAscii();
  },0);
});
var huhs=document.getElementsByClassName("huh");
for (var i=0;i<huhs.length;i++){
  huhs[i].addEventListener("click",function(event){
    alert(event.target.title);
  });
}
var tools=document.getElementsByClassName("toolitem");
var huhs=document.getElementsByClassName("huh");
for (var i=0;i<tools.length;i++){
  (function(index){
    tools[index].addEventListener("click",function(event){
      if (event.target.classList.contains("active")){return;}
      var context=document.getElementById("toolcontext");
      context.style.display="block";
      context.style.top=event.target.offsetHeight+"px";
      context.style.left=event.target.offsetLeft+"px";
      var citems=document.getElementsByClassName("contextitem");
      for (var n=0;n<citems.length;n++){
        citems[n].style.display=citems[n].getAttribute("group")==index?"block":"none";
      }
      for (var n=0;n<tools.length;n++){
        tools[n].classList.remove("active");
      }
      event.target.classList.add("active");
      event.stopPropagation();
    });
  })(i);
}
document.body.addEventListener("click",function(){
  document.getElementById("toolcontext").style.display="none";
  for (var i=0;i<tools.length;i++){
    tools[i].classList.remove("active");
  }
});
document.getElementById("files").addEventListener("click",function(event){
  if (event.target.className=="file"){
    document.getElementById("fileinput").value=event.target.getAttribute("true_name");
    searchFiles();
  }
});
document.body.addEventListener("keydown",function(event){
  var kc=event.keyCode=event.keyCode;
  var popup=document.getElementById("shadow").style.display=="flex";
  if (event.altKey){
    if (kc==67){clearConsole(); event.preventDefault();}
    else if (kc==86){toggleMode(); event.preventDefault();}
    else if (kc==78){newProject(); event.preventDefault();}
    if (popup){return;}
    if (kc==65){openAscii(); event.preventDefault();}
  }else if (kc==117){
    if (!running){
      if (event.ctrlKey){
        cleanAndRun();
      }else{
        run();
      }
    }
    event.preventDefault();
  }else if (event.ctrlKey){
    if (popup){return;}
    if (kc==76||kc==79){openSaveOpen("open"); event.preventDefault();}
    else if (kc==83){openSaveOpen("save"); event.preventDefault();}
    else if (kc==77){openDump(); event.preventDefault();}
  }else if (popup&&(kc==27||kc==46)){
    var popups=document.getElementsByClassName("popup");
    for (var i=0;i<popups.length;i++){popups[i].style.display="none";}
    document.getElementById("shadow").style.display="none";
  }else if (running){
    if (kc==27||kc==35){
      stop();
      event.preventDefault();
    }else if(kc==32){
      if (thread)pause();
      else play();
      event.preventDefault();
    }else if(kc==9&&live&&running&&!thread){
      step();
      event.preventDefault();
    }
  }
});
document.getElementById("asciiwrapper").addEventListener("click",function(event){
  if (event.target.className=="asciisquare"){
    var char=event.target.innerHTML;
    document.getElementById("asciidisplay").innerHTML=char;
    document.getElementById("asciinum").innerHTML=event.target.getAttribute("charcode") || char.charCodeAt(0) || 0;
    document.getElementById("charerror").style.display=event.target.getAttribute("charcode")?"block":"none";
  }
});
window.addEventListener("load",loadData);
window.addEventListener("unload",saveData);
document.body.addEventListener("mousemove",function(event){addTourInfo(event)});
document.getElementById("fileinput").addEventListener("keyup",searchFiles);

function run(){
  inpPointer=0;
  runPointer=0;
  pointer=0;
  iters=0;
  data=[0];
  
  addLine();
  
  fillMem();
  memsquares[0].classList.remove("inactive");
  runData=toDataArr(infield.value);
  runData.push({op:"halt",hidden:true});
  input=document.getElementById("input").value;
  document.body.setAttribute("running",true);
  document.body.setAttribute("playing",true);
  infield.setAttribute("readonly","");
  document.getElementById("opline").innerHTML="";
  setInputs();
  
  main:
  for (var i=runData.length-1;i>=0;i--){
    if (runData[i].op=="cond"){
      for (var n=i+1;n<runData.length;n++){
        if (runData[n].jump==undefined&&runData[n].op=="break"){
          runData[i].jump=n;
          runData[n].jump=i;
          continue main;
        }
      }
      showError("Failed to compile: unmatched bracket at character "+runData[i].pos);
      infield.focus();
      var start=normalizePos(runData[i].pos+runData[i].emoji*(showEmoji?1:0));
      infield.selectionStart=start-(showEmoji?2:1);
      infield.selectionEnd=start;
      time=new Date().getTime();
      completeRun();
      return;
    }
  }
  
  for (var i in runData){
    if ((runData[i].op=="cond"||runData[i].op=="break")&&runData[i].jump==undefined){
      showError("Failed to compile: unmatched bracket at character "+runData[i].pos);
      infield.focus();
      var start=normalizePos(runData[i].pos+runData[i].emoji*(showEmoji?1:0));
      infield.selectionStart=start-(showEmoji?2:1);
      infield.selectionEnd=start;
      time=new Date().getTime();
      completeRun();
      return;
    }
  }
  
  time=new Date().getTime();
  
  if (runData.length==1){
    completeRun();
    return;
  }
  
  setTitle(true);
  
  if (live){
    genLive();
    opsquares=document.getElementsByClassName("opsquare");
    thread=setInterval(cycle,uservars.throttle);
    cycle();
  }else{
    thread=setInterval(shortCycle,0);
  }
  running=true;
}

function pause(){
  clearInterval(thread);
  thread=null;
  document.body.setAttribute("playing",false);
}

function play(){
  document.body.setAttribute("playing",true);
  if (live){
    thread=setInterval(cycle,uservars.throttle);
  }else{
    thread=setInterval(shortCycle,0);
  }
}

function step(){
  cycle();
}

function addLine(){
  outElem=document.createElement("div");
  outElem.className="consolemsg";
  var left=document.createElement("div");
  left.className="left";
  bar=document.createElement("div");
  bar.className="bar";
  outElem.appendChild(left);
  outElem.appendChild(bar);
  var cns=document.getElementById("console");
  cns.appendChild(outElem);
  addMsg();
}

function addMsg(){
  msgElem=document.createElement("pre");
  bar.appendChild(msgElem);
  document.getElementById("console").scrollTop=1e8;
}

function shortCycle(){
  for (var i=0;i<1000;i++){
    if (runPointer<runData.length){
      bf[runData[runPointer].op](runData[runPointer].jump);
      if (runData[runPointer].opindex>7){
        runPointer++;
        break;
      }
      runPointer++;
      iters++;
      if (iters>=uservars.maxiter){
        showError("Max instruction count exceeded");
        completeRun();
        return
      }else if(pointer>=1000000){
        showError("Memory warning - cell count extremely high");
        completeRun();
        return
      }
    }
  }
  completeRun(true);
}

function cycle(){
  if (runPointer<runData.length){
    opsquares[runPointer>0?runPointer-1:0].classList.remove("active");
    if (pointer<uservars.maxmem){
      memsquares[pointer].classList.remove("active");
    }
    bf[runData[runPointer].op](runData[runPointer].jump);
    completeRun(true);
    if (runPointer>runData.length-2){
      opsquares[runPointer-1].classList.add("active");
      memsquares[pointer].classList.add("active");
      return;
    }
    opsquares[runPointer].classList.add("active");
    if (pointer<uservars.maxmem){
      if (pointer>=memlen){
        hexCellsHigher();
      }
      memsquares[pointer].classList.add("active");
      memsquares[pointer].classList.remove("inactive");
      memsquares[pointer].innerHTML=data[pointer];
    }
    scrollLive();
    runPointer++;
    iters++;
    if (iters>=uservars.maxiter){
      showError("Max instruction count exceeded");
      completeRun();
    }
  }
}

function scrollLive(){
  if (scroll){
    var memory=document.getElementById("memory");
    var rect=memsquares[pointer].getBoundingClientRect();
    memory.scrollTop=memsquares[pointer].offsetTop+rect.height/2-memory.offsetHeight/2;

    var pnter=Math.min(runPointer,runData.length-2);
    var opline=document.getElementById("opline");
    var rect=opsquares[pnter].getBoundingClientRect();
    opline.scrollTop=opsquares[pnter].offsetTop+rect.height/2-opline.offsetHeight/2;
  }
}

function completeRun(noHalt){
  var newTime=new Date().getTime()-time;
  if (newTime<1000){
    newTime+=" ms";
  }else{
    var zeroes=(""+newTime).length-((""+newTime/1000).length-1);
    newTime=""+(newTime/1000);
    if (zeroes==4){newTime+="."; zeroes--;}
    for (var i=0;i<zeroes;i++){
      newTime+="0";
    }
    newTime+=" s";
  }
  
  document.getElementById("runtime_data").innerHTML=newTime;
  document.getElementById("instr_data").innerHTML=iters;
  document.getElementById("mem_data").innerHTML=data.length;
  document.getElementById("op_data").innerHTML=runData.length-1;
  
  document.getElementById("console").scrollTop=1e8;
  
  if (!noHalt){
    infield.removeAttribute("readonly");
    addMsg();
    msgElem.innerHTML="run "+(++runs)+" ("+newTime+")";
    msgElem.className="gray";
    document.body.setAttribute("running",false);
    document.body.setAttribute("playing",false);
    setTitle(false);
    clearInterval(thread);
    thread=null;
    running=false;
  }
}

function stop(){
  showError("Interrupted script");
  completeRun();
}

function cleanAndRun(returnStr){
  infield.value=clean();
  if (showEmoji)infield.value=asciiToEmoji();
  run();
}

function clean(str){
  str=str || (showEmoji?emojiToAscii():infield.value),prevLen=0;
  while (str.length!=prevLen){
    prevLen=str.length;
    //( |\n){0,} matches operators with an arbitrary amount of spaces/newlines between them.
    //\[[^\<\>\+\-\,\.\[\]\|\~\$\%]{0,}\] matches comments on the form [abc] but not any [] that contain reserved characters. 
    str=str.replace(/\+( |\n){0,}\-|\-( |\n){0,}\+|\<( |\n){0,}\>|\>( |\n){0,}\<|\[[^\<\>\+\-\,\.\[\]\|\~\$\%]{0,}\]/g,"");
  }
  return str;
}

function strip(){
  var str=showEmoji?emojiToAscii():infield.value;
  var regex=/[\<\>\+\-\,\.\[\]\|\~\$\%]/g;
  return (str.match(regex) || []).join("");
}

function Brainfuck(){
  this.inc=function(){
    data[pointer]=(data[pointer]+1)%256;
  }
  
  this.dec=function(){
    data[pointer]=(255+data[pointer])%256;
  }
  
  this.incp=function(){
    pointer++;
    if (data.length<=pointer){data.push(0);}
  }
  
  this.decp=function(){
    var dl=data.length;
    pointer=(dl-1+pointer)%dl;
  }
  
  this.putchar=function(){
    var char=String.fromCharCode(data[pointer]);
    if (char=="\n"){addMsg();}
    else if(data[pointer]!=13){msgElem.innerHTML+=char;}
  }
  
  this.getchar=function(){
    data[pointer]=(input.charCodeAt(inpPointer) || 0);
    inpPointer++;
  }
  
  this.cond=function(jump){
    if (!data[pointer]){
      runPointer=jump;
    }
  }
  
  this.break=function(jump){
    if (data[pointer]){
      runPointer=jump;
    }
  }
  
  this.halt=function(noError){
    completeRun();
    reconstructLive();
  }
    
  this.quit=function(noError){
    showError("Internally interrupted script");
    completeRun();
  }
  
  this.pause=function(){
    clearInterval(thread);
    thread=null;
    document.body.setAttribute("playing",false);
    completeRun(true);
    reconstructLive();
  }
  
  this.speed=function(){
    if (live){
      speedy=true;
      clearInterval(thread);
      thread=setInterval(shortCycle,0);
    }
  }
}

function loadDefault(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var prjs=JSON.parse(this.responseText);
      for (var i in prjs){
        if (!projects[i]){
          projects[i]=prjs[i];
        }
      }
      setTimeout(saveLog,500);
    }
  };
  
  xhttp.open("GET","https://picturelements.github.io/textfiles/defaultBF.json",true);
  xhttp.send();
}

function toDataArr(str,showNL){
  var opOut=[],count=0,emojiCount=0,pushable=true;
  for (var i in str){
    count++;
    if (str[i]=="\n"){
      if (showNL)opOut.push({op:"newline"});
      pushable=true;
    }
    for (var n=0;n<keys.length;n++){
      if (keys[n]==str[i].charCodeAt(0)||origKeys[n]==str[i]){
        if (showEmoji){count--;}
        emojiCount++;
        if (pushable&&(keys[8]==str[i].charCodeAt(0)||origKeys[8]==str[i])){pushable=false;}
        
        if (pushable){
          opOut.push({
            op:ops[n],
            pos:count,
            opindex:n,
            emoji:emojiCount
          });
        }
        break;
      }
    }
  }
  //console.log(opOut);
  return opOut;
}

function clickButton(evt){
  var index=evt.target.getAttribute("data-index");
  addChar(showEmoji?emoji[index]:origKeys[index]);
}

function addChar(emoji,omitLast){
  omitLast=omitLast?1:0;
  var sIndex=infield.selectionStart;
  var start=infield.value.substring(0,normalizePos(sIndex-omitLast));
  var end=infield.value.substring(normalizePos(infield.selectionEnd),infield.value.length);
  var st=infield.scrollTop;
  infield.value=start+emoji+end;
  infield.focus();
  infield.selectionStart=normalizePos(sIndex-omitLast)+1;
  infield.selectionEnd=normalizePos(sIndex-omitLast)+1;
  infield.scrollTop=st;
}

function normalizePos(pos){
  if (infield.value.charCodeAt(pos)!=null&&infield.value.charCodeAt(pos-1)==55357){
    return pos+1;
  }
  return pos;
}

function showError(str){
  addMsg();
  msgElem.innerHTML=str;
  outElem.classList.add("error");
  msgElem.classList.add("error");
}

function asciiToEmoji(){
  var out="",str=infield.value;
  main:
  for (var i in str){
    for (var n=0;n<keys.length;n++){
      if (str[i]==origKeys[n]){
        out+=emoji[n];
        continue main;
      }
    }
    out+=str[i];
  }
  return out;
}

function emojiToAscii(onlyKeys,str){
  var str=str==undefined?infield.value:str;
  var out="";
  main:
  for (var i in str){
    var cc=str.charCodeAt(i);
    if (cc!=55357){
      for (var n=0;n<(onlyKeys?8:keys.length);n++){
        if (cc==keys[n]||cc==origKeys[n].charCodeAt(0)){
          out+=origKeys[n];
          continue main;
        }
      }
      if (!onlyKeys)out+=str[i];
    }
  }
  return out;
}

function toggleMode(){
  showEmoji=!showEmoji;
  infield.value=showEmoji?asciiToEmoji():emojiToAscii();
  document.getElementById("toggleEmoji").innerHTML="View mode: "+(showEmoji?"emoji":"ascii")+"<span>Alt+V</span>";
  document.body.setAttribute("emoji",showEmoji);
}

function toggleLive(){
  live=!live;
  document.body.setAttribute("live",live);
  document.getElementById("toggleLive").innerHTML="simulation mode: "+(live?"on":"off");
  if (live){
    document.getElementById("opline").innerHTML="";
    fillMem();
  }
}

function toggleComp(){
  comp=!comp;
  document.body.setAttribute("wrap",comp);
  document.getElementById("toggleComp").innerHTML="compressed: "+(comp?"on":"off");
}

function toggleScroll(){
  scroll=!scroll;
  document.getElementById("toggleScroll").innerHTML="auto scroll: "+(scroll?"on":"off");
}

function updateUserVars(evt){
  var val=evt.target.value
  if (val!=""&&val>=0){
    var name=evt.target.getAttribute("data-name");
    uservars[name]=parseInt(val);
    if (name=="throttle"){
      uservars.throttle=Math.floor(Math.pow(uservars.throttle/20,2));
      document.getElementById("throttle_label").innerHTML=uservars.throttle;
      if (live&&thread){
        clearInterval(thread);
        thread=setInterval(cycle,uservars.throttle);
      }
    }
  }
}

function genLive(pnter){
  pnter=pnter || 0;
  var opline=document.getElementById("opline"),lastWasNL=false;
  var rd=toDataArr(infield.value,true);
  for (var i in rd){
    if (rd[i].op!="newline"&&lastWasNL){
      var spacer=document.createElement("div");
      spacer.className="spacer";
      opline.appendChild(spacer);
      lastWasNL=false;
    }else if (rd[i].op=="newline"){
      lastWasNL=true;
      continue;
    }
    var opsquare=document.createElement("div");
    opsquare.className="opsquare "+(i==pnter?"active":"");
    opsquare.setAttribute("data-emoji",emoji[rd[i].opindex]);
    opsquare.setAttribute("data-key",origKeys[rd[i].opindex]);
    opline.appendChild(opsquare);
  }
}

function reconstructLive(){
  if (!speedy)return;
  speedy=false;
  document.getElementById("opline").innerHTML="";
  genLive(-1);
  document.getElementsByClassName("opsquare")[Math.min(runPointer,runData.length-2)].classList.add("active");
  fillMem();
  while(data.length>memlen){
    hexCellsHigher();
  }
  for (var i=0;i<memsquares.length&&i<data.length;i++){
    memsquares[i].classList.remove("inactive");
    if (i==pointer)memsquares[i].classList.add("active");
    memsquares[i].innerHTML=data[i];
  }
  scrollLive();
}

function closeWin(elem){
  elem=getParent(elem,"popup");
  elem.style.display="none";
  elem.parentElement.style.display="none";
}

function getRaw(ook){
  document.getElementById("shadow").style.display="flex";
  var pt=document.getElementById("plaintext");
  pt.style.display="flex";
  var ta=pt.getElementsByTagName("textarea")[0];
  var darr=toDataArr(clean(strip())),out="";
  var ookOps=["Ook. Ook?","Ook? Ook.","Ook. Ook.","Ook! Ook!","Ook! Ook.","Ook. Ook!","Ook! Ook?","Ook? Ook!"];
  
  for (var i in darr){
    out+=ook?(ookOps[darr[i].opindex]+" "):origKeys[darr[i].opindex];
  }
  ta.value=out
  setTimeout(function(){ta.select();},1);
}

function saveData(returnObj){
  var data={
    name:openName,
    vars:uservars,
    code:emojiToAscii(),
    input:document.getElementById("input").value,
    showEmoji:showEmoji,
    live:live,
    comp:comp,
    scroll:scroll
  };
  localStorage.setItem("userdata",JSON.stringify(data));
  return JSON.parse(JSON.stringify(data));
}

function loadData(obj){
  var data=!obj||obj.constructor.name=="Event"?JSON.parse(localStorage.getItem("userdata")):obj;
  if (data!=null){
    infield.value=data.code.replace(/\(hash\)/g,"#");
    if (data.showEmoji){infield.value=asciiToEmoji();}
    document.getElementById("input").value=data.input;
    uservars=data.vars;
    if (data.showEmoji^showEmoji){toggleMode();}
    if (data.live^live){toggleLive();}
    if (data.comp^comp){toggleComp();}
    if (data.scroll^scroll){toggleScroll();}
    
    openName=data.name || null;
    setTitle();
    setInputs();
  }
}

function setInputs(){
  for (var i in uservars){
    var elem=document.querySelector("input[data-name="+i+"]");
    elem.value=uservars[i];
    if (i=="throttle"){
      document.getElementById("throttle_label").innerHTML=elem.value;
      elem.value=Math.sqrt(elem.value)*20;
    }
  }
}

function saveProject(elem){
  var name=document.getElementById("fileinput").value;
  if (name==""){return;}
  if (projects[name]&&elem.innerHTML=="save"){
    elem.innerHTML="save over?";
    return;
  }
  openName=name;
  setTitle(false);
  projects[name]={
    data:saveData(true),
    created:new Date().getTime(),
    size:emojiToAscii().length
  };
  elem.innerHTML="save";
  localStorage.setItem("projects",JSON.stringify(projects));
  closeWin(elem);
  saveLog();
}

function openProject(elem){
  var name=document.getElementById("fileinput").value;
  if (!projects[name]){
    elem=document.querySelector(".file[name*='"+name.toLowerCase()+"']");
    if (!elem){return}
    name=elem.getAttribute("true_name");
  }
  loadData(projects[name].data);
  infield.value=showEmoji?asciiToEmoji():emojiToAscii();
  closeWin(elem);
  document.getElementById("opline").innerHTML="";
  fillMem();
  saveLog();
}

function newProject(elem){
  if (running){completeRun();}
  saveLog();
  runs=0;
  loadData({
    name:null,
    vars:{
      maxiter:10000,
      throttle:10,
      maxmem:1000
    },
    code:"",
    input:"",
    showEmoji:true,
    live:true,
    comp:false,
    scroll:true
  });
  clearConsole();
  document.getElementById("opline").innerHTML="";
  fillMem();
  if (elem)closeWin(elem);
}

function clearConsole(){
  document.getElementById("console").innerHTML="";
  document.getElementById("runtime_data").innerHTML="N/A";
  document.getElementById("instr_data").innerHTML="N/A";
  document.getElementById("mem_data").innerHTML="N/A";
  document.getElementById("op_data").innerHTML="N/A";
}

function genFileList(){
  var container=document.getElementById("files");
  container.innerHTML="";
  var elems=[];
  for (var name in projects){
    var file=document.createElement("div");
    file.className="file";
    file.setAttribute("name",name.toLowerCase());
    file.setAttribute("true_name",name);
    file.innerHTML="<span>"+name+"</span><span>"+projects[name].size+" characters</span><span>"+new Date(projects[name].created).toLocaleString()+"</span>";
    elems.push({
      dom:file,
      name:name
    });
  }
  
  for (var i=0;i<elems.length;i++){
    for (var n=i+1;n<elems.length;n++){
      if (elems[i].name.localeCompare(elems[n].name)>0){
        var tmpElem=elems[i];
        elems[i]=elems[n];
        elems[n]=tmpElem;
      }
    }
  }
  
  for (var i in elems){
    container.appendChild(elems[i].dom);
  }
}

function openSaveOpen(type){
  document.getElementById("shadow").style.display="flex";
  var so=document.getElementById("saveopen");
  so.style.display="flex";
  so.setAttribute("type",type);
  document.getElementById("fileinput").value=type=="save"&&openName?openName:"";
  genFileList();
  searchFiles();
  document.getElementById("fileinput").focus();
}

function getParent(elem,cls){
  while(true){
    if (elem.classList.contains(cls)){return elem;}
    if (elem.tagName=="BODY"){return null;}
    elem=elem.parentElement;
  }
}

function searchFiles(){
  var term=document.getElementById("fileinput").value;
  document.getElementById("search").innerHTML=term?".file[name*='"+term.toLowerCase()+"']{display:flex;}":".file{display:flex;}";
  document.getElementsByClassName("sobutton")[0].innerHTML="save";
}

function fillMem(){
  var container=document.getElementById("innermem");
  container.innerHTML="";
  memlen=Math.min(16*7,uservars.maxmem);
  for (var i=0;i<memlen;i++){
    if (i%16==0){
      addCountSq(Math.floor(i/16),container);
    }
    var square=document.createElement("div");
    square.className="memsquare inactive";
    square.innerHTML="0";
    container.appendChild(square);
  }
  memsquares=container.getElementsByClassName("memsquare");
}

function addDumpCell(index,val){
  var container=document.getElementById("dumpinner");
  if (index%16==0){
    addCountSq(Math.floor(index/16),container);
  }
  var square=document.createElement("div");
  square.className="memsquare";
  square.innerHTML=val;
  container.appendChild(square);
}

function hexCellsHigher(){
  var container=document.getElementById("innermem");
  addCountSq(Math.floor((memlen+1)/16),container);
  for (var i=0;i<16&&memlen+i<uservars.maxmem;i++){
    var square=document.createElement("div");
    square.className="memsquare inactive";
    square.innerHTML="0";
    container.appendChild(square);
  }
  memlen+=16;
  memsquares=container.getElementsByClassName("memsquare");
}

function addCountSq(val,container){
  var square=document.createElement("div");
  square.className="countsquare";
  square.innerHTML=val;
  container.appendChild(square);
}

function addCountBar(){
  var container=document.getElementById("countbar");
  addCountSq("",container);
  for (var i=0;i<16;i++){
    addCountSq(i,container);
  }
  document.getElementById("dumpcountbar").innerHTML=container.innerHTML;
}

function openAscii(){
  document.getElementById("shadow").style.display="flex";
  document.getElementById("ascii").style.display="flex";
}

function genAscii(){
  var special=[0,"␀",9,"␉",10,"↵",11,"␋",12,"↡",13,"↵"],next=0,counter=0;
  var container=document.getElementById("asciiblock");
  for (var h=0;h<16;h++){
    addCountSq(h*16,container);
    for (var w=0;w<16;w++){
      var square=document.createElement("div");
      square.className="asciisquare";
      square.innerHTML=String.fromCharCode(counter);
      if (counter==special[next]){
        square.innerHTML=special[next+1];
        square.setAttribute("charcode",counter);
        next+=2;
      }
      container.appendChild(square);
      counter++;
    }
  }
}

addCountBar();
fillMem();
genAscii();

function openDump(){
  document.getElementById("shadow").style.display="flex";
  document.getElementById("memdump").style.display="flex";
  document.getElementById("dumpinner").innerHTML="";
  for (var i in data){
    addDumpCell(i,data[i]);
  }
}

function closeTip(elem){
  elem.parentElement.style.display="none";
  setTour(false);
}

function startTour(){
  saveLog(true);
  setTour(true);
  document.getElementById("tipwrapper").style.display="flex";
  document.getElementById("tipbar").style.display="flex";
  document.getElementById("tourbubble").style.display="none";
  document.getElementById("shadowbox").style.display="none";
  newProject();
}

function revert(){
  loadData();
  setTour(false);
}

function setTour(bool){
  document.body.setAttribute("tour",bool);
  tour=bool;
}

function addTourInfo(evt){
  if (tour){
    var td=getTourData(evt.target);
    var tb=document.getElementById("tourbubble");
    var sb=document.getElementById("shadowbox");
    tb.style.display=td?"block":"none";
    sb.style.display=td?"block":"none";
    if (td){
      var arr=td.split("|");
      tb.innerHTML="<p><b>"+arr[0]+"</b><br>"+arr[1]+"</p>";
      var rect=getAnchorElem(evt.target).getBoundingClientRect();
      var top=window.scrollY+rect.top;
      tb.style.top=((rect.top+rect.height+tb.offsetHeight+10<window.innerHeight)?(top+rect.height+5):(top-tb.offsetHeight-5))+"px";
      tb.style.left=rect.left+"px";
      sb.style.top=top+"px";
      sb.style.left=rect.left+"px";
      sb.style.width=rect.width+"px";
      sb.style.height=rect.height+"px";
    }
  }
}

function getTourData(elem){
  while(true){
    var dt=elem.getAttribute("data-tour");
    if (dt){return dt;}
    else if (elem.tagName=="BODY"){return false;}
    elem=elem.parentElement;
  }
}

function getAnchorElem(elem){
  while(true){
    if (elem.tagName=="DIV"||elem.getAttribute("data-tour")!=null||elem.tagName=="BODY"){return elem;}
    elem=elem.parentElement;
  }
}

function download(all){
  //replace hashes to make data download properly in FF
  var obj=projects;
  if (!all){
    obj={
      data:saveData(),
      created:new Date().getTime(),
      size:emojiToAscii().length
    };
  }
  var data="data:text/json;charset=utf-8,"+JSON.stringify(obj).replace(/#/g,"(hash)");
  var aTag=document.getElementById("download");
  aTag.href=data;
  aTag.setAttribute("download",all?"projects.json":((openName || "untitled")+".json").toLowerCase().replace(/ /g,"_"));
  aTag.click();
}

function readJSON(){
  
}

function setTitle(running){
  var title=openName || "untitled";
  if (edited&&title!="untitled"){title+="*";}
  document.title=title+(running?" (running)":" - emojifuck");
  document.getElementById("titlebar").innerHTML=title+(running?" (running)":"");
}

function saveLog(autoSave){
  var obj=saveData();
  if (autoSave){
    obj.saveName="autosave@"+(obj.name || "untitled").toLowerCase().replace(/ /g,"_");
  }else{
    obj.saveName=(obj.name || "untitled");
  }
  obj.savedAt=new Date().getTime();
  autosave.push(obj);
  if (autosave.length>50){
    autosave.splice(0,1);
  }
  checkEdit(obj);
  setTitle();
  clearTimeout(timeout);
}

function checkEdit(obj){
  edited=false;
  var lastSave=(projects[openName] || {}).data;
  if (lastSave){
    var code=lastSave.code.replace(/\(hash\)/g,"#");
    if (code.length!=obj.code.length||code!=obj.code){
      edited=true;
    }
  }
}

function openSaveHistory(){
  clearTimeout(timeout);
  infield.blur();
  document.getElementById("shadow").style.display="flex";
  document.getElementById("autosave").style.display="flex";
  var container=document.getElementById("savecontent")
  container.innerHTML="";
  var time=new Date().getTime();
  for (var i=autosave.length-1;i>=0;i--){
    var item=document.createElement("tr");
    var as=autosave[i],charData="<td>---</td>";
    if (i>0&&as.name==autosave[i-1].name){
      var diff=emojiToAscii(false,as.code).length-emojiToAscii(false,autosave[i-1].code).length;
      charData="<td style='color:"+(diff<0?"#f55":"#8f8")+"'>"+(diff>0?"+":"")+diff+"c</td>";
    }
    item.className="saveitem";
    item.innerHTML="<td>"+(as.saveName || "untitled")+"</td><td>"+emojiToAscii(false,as.code).length+"c</td>"+charData+"<td>"+toTimeStr(time-as.savedAt)+"</td>";
    (function(obj){
      item.addEventListener("click",function(event){
        loadData(obj);
        checkEdit(obj);
        setTitle();
        closeWin(event.target);
      });
    })(as);
    container.appendChild(item);
  }
}

function toTimeStr(diff){
  diff=Math.round(diff/1000);
  var out=diff<86400?" ago":"";
  if (diff%60!=0){out=diff%60+"s"+out;}
  diff=Math.floor(diff/60);
  if (diff%60!=0){out=diff%60+"m"+out;}
  diff=Math.floor(diff/60);
  if (diff%24!=0){out=diff%24+"h"+out;}
  diff=Math.floor(diff/24);
  if (diff!=0){out=diff+"d "+out;}
  return out;
}

function openHotkeys(){
  document.getElementById("shadow").style.display="flex";
  document.getElementById("hotkeys").style.display="flex";
}
