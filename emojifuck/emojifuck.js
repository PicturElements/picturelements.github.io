var data=[0],runData=[];
var pointer=0,runPointer=0,inpPointer=0;
var input,iters=0,runs=0;
var outElem,msgElem,bar,time,thread=null;
var showEmoji=true,live=true,comp=false;

var ops=["incp","decp","inc","dec","putchar","getchar","cond","break"];
var origKeys=['>','<','+','-','.',',','[',']'];
var keys=[56393,56392,56834,56881,56396,56495,56908,56911];
var emoji=['👉','👈','😂','😱','👌','💯','🙌','🙏'];

var buttons=document.getElementsByClassName("emojibutton");
var numinputs=document.querySelectorAll("input[type=number]");
var opsquares,memsquares,memlen=16*6;
var infield=document.getElementById("datain");
var bf=new Brainfuck();

var uservars={
  maxiter:10000,
  throttle:10,
  maxmem:1000
};
var projects=JSON.parse(localStorage.getItem("projects"));
if (!projects){loadDefault();}

for (var i=0;i<buttons.length;i++){
  buttons[i].addEventListener("click",function(event){
    clickButton(event);
  });
  buttons[i].setAttribute("data-emoji",emoji[i]);
  buttons[i].setAttribute("data-index",i);
}
for (var i=0;i<numinputs.length;i++){
  numinputs[i].addEventListener("change",function(event){updateUserVars(event);});
  numinputs[i].addEventListener("keyup",function(event){updateUserVars(event);});
}
infield.addEventListener("keydown",function(event){
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
      if (event.ctrlKey&&event.keyCode==86){
        infield.value=showEmoji?asciiToEmoji():emojiToAscii();
        return;
      }
      if (!showEmoji){return;}
      var char=infield.value[infield.selectionStart-1];
      for (var i in origKeys){
        if (char==origKeys[i]){
          addChar(emoji[i],true);
        }
      }
    },0);
  }
});
window.addEventListener("load",loadData);
window.addEventListener("unload",saveData);
document.getElementById("fileinput").addEventListener("keyup",searchFiles);

function run(){
  inpPointer=0;
  runPointer=0;
  pointer=0;
  iters=0;
  data=[0];
  
  addLine();
  
  fillMem();
  runData=toDataArr(document.getElementById("datain").value);
  input=document.getElementById("input").value;
  document.body.setAttribute("running",true);
  document.body.setAttribute("playing",true);
  for (var i=0;i<numinputs.length;i++){
    numinputs[i].value=uservars[numinputs[i].getAttribute("data-name")];
  }
  
  for (var i=runData.length-1;i>=0;i--){
    if (runData[i].op=="cond"){
      for (var n=i+1;n<runData.length;n++){
        if (runData[n].jump==undefined&&runData[n].op=="break"){
          runData[i].jump=n;
          runData[n].jump=i;
          break;
        }
      }
    }
  }
  
  for (var i in runData){
    if ((runData[i].op=="cond"||runData[i].op=="break")&&runData[i].jump==undefined){
      showError("Failed to compile: unmatched bracket at character "+runData[i].pos);
      infield.focus();
      infield.selectionStart=normalizePos(runData[i].abspos)-2;
      infield.selectionEnd=normalizePos(runData[i].abspos);
      time=new Date().getTime();
      completeRun();
      return;
    }
  }
  
  time=new Date().getTime();
  
  if (live){
    genLive();
    opsquares=document.getElementsByClassName("opsquare");
    cycle();
    thread=setInterval(cycle,uservars.throttle);
  }else{
    /*while (runPointer<runData.length){
      bf[runData[runPointer].op](runData[runPointer].jump);
      runPointer++;
      iters++;
      if (iters>=uservars.maxiter){
        showError("Max runtime exceeded");
        break;
      }
    }
    completeRun();*/
    thread=setInterval(shortCycle,0);
  }
}

function pause(){
  clearInterval(thread);
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
      runPointer++;
      iters++;
      if (iters>=uservars.maxiter){
        showError("Max runtime exceeded");
        completeRun();
        return
      }else if(pointer>=1000000){
        showError("Memory warning - cell count extremely high");
        completeRun();
        return
      }
    }else{
      completeRun();
      return;
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
    opsquares[runPointer].classList.add("active");
    if (pointer<uservars.maxmem){
      if (pointer>=memlen){
        hexCellsHigher();
      }
      memsquares[pointer].classList.add("active");
      memsquares[pointer].innerHTML=data[pointer] || 0;
      var memory=document.getElementById("memory");
      var rect=memsquares[pointer].getBoundingClientRect();
      memory.scrollTop=rect.height*(Math.floor(pointer/16))+rect.height/2-memory.offsetHeight/2;
    }
    runPointer++;
    iters++;
    if (iters>=uservars.maxiter){
      showError("Max runtime exceeded");
      completeRun();
    }
  }else{
    opsquares[runPointer-1].classList.remove("active");
    completeRun();
  }
}

function completeRun(noPrint){
  var newTime=new Date().getTime()-time;
  newTime=newTime<1000?(newTime+" ms"):(newTime/1000+" s");
  
  document.getElementById("runtime_data").innerHTML=newTime;
  document.getElementById("instr_data").innerHTML=iters;
  document.getElementById("mem_data").innerHTML=data.length;
  document.getElementById("op_data").innerHTML=runData.length;
  
  if (!noPrint){
    addMsg();
    msgElem.innerHTML="run "+(++runs)+" ("+newTime+")";
    msgElem.className="gray";
    document.getElementById("console").scrollTop=1e8;
    document.body.setAttribute("running",false);
    document.body.setAttribute("playing",false);
    clearInterval(thread);
  }
}

function stop(){
  showError("Interrupted script");
  completeRun();
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
    pointer--;
    if (pointer<0){pointer=data.length-1;}
  }
  
  this.putchar=function(){
    var char=String.fromCharCode(data[pointer]);
    if (char=="\n"){addMsg();}
    else{msgElem.innerHTML+=char;}
  }
  
  this.getchar=function(){
    data[pointer]=input.charCodeAt(inpPointer);
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
}

function loadDefault(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      projects=JSON.parse(this.responseText);
    }
  };
  
  xhttp.open("GET","https://picturelements.github.io/textfiles/defaultBF.json",true);
  xhttp.send();
}

function toDataArr(str,showNL){
  var opOut=[],count=0;
  for (var i in str){
    count++;
    if (showNL&&str[i]=="\n"){
      opOut.push({op:"newline"});
    }
    for (var n=0;n<8;n++){
      if (keys[n]==str[i].charCodeAt(0)||!showEmoji&&origKeys[n]==str[i]){
        count--;
        opOut.push({
          op:ops[n],
          pos:count,
          abspos:parseInt(i),
          opindex:n
        });
        break;
      }
    }
  }
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
  infield.value=start+emoji+end;
  infield.focus();
  infield.selectionStart=normalizePos(sIndex-omitLast)+1;
  infield.selectionEnd=normalizePos(sIndex-omitLast)+1;
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
  var out="";
  main:
  for (var i in infield.value){
    for (var n=0;n<8;n++){
      if (infield.value[i]==origKeys[n]){
        out+=emoji[n];
        continue main;
      }
    }
    out+=infield.value[i];
  }
  return out;
}

function emojiToAscii(onlyKeys){
  var str=infield.value;
  var out="";
  main:
  for (var i in str){
    var cc=str.charCodeAt(i);
    if (cc!=55357){
      for (var n=0;n<8;n++){
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
  document.getElementById("toggleEmoji").innerHTML=(showEmoji?"emoji":"ascii")+" mode";
  document.body.setAttribute("emoji",showEmoji);
}

function toggleLive(){
  live=!live;
  document.body.setAttribute("live",live);
  document.getElementById("toggleLive").innerHTML="simulation mode: "+(live?"on":"off");
}

function toggleComp(){
  comp=!comp;
  document.body.setAttribute("wrap",comp);
  document.getElementById("toggleComp").innerHTML="compressed: "+(comp?"on":"off");
}

function updateUserVars(evt){
  var val=evt.target.value
  if (val!=""&&val>=0){
    uservars[evt.target.getAttribute("data-name")]=parseInt(val);
  }
}

function genLive(){
  var opline=document.getElementById("opline");
  opline.innerHTML="";
  var rd=toDataArr(infield.value,true);
  for (var i in rd){
    if (rd[i].op=="newline"){
      var spacer=document.createElement("div");
      spacer.className="spacer";
      opline.appendChild(spacer);
      continue;
    }
    var opsquare=document.createElement("div");
    opsquare.className="opsquare "+(i==0?"active":"");
    opsquare.setAttribute("data-emoji",emoji[rd[i].opindex]);
    opsquare.setAttribute("data-key",origKeys[rd[i].opindex]);
    opline.appendChild(opsquare);
  }
}

function closeWin(elem){
  elem=getParent(elem,"popup");
  elem.style.display="none";
  elem.parentElement.style.display="none";
}

function getRaw(){
  document.getElementById("shadow").style.display="flex";
  var pt=document.getElementById("plaintext");
  pt.style.display="flex";
  var ta=pt.getElementsByTagName("textarea")[0];
  ta.value=emojiToAscii(true);
  setTimeout(function(){ta.select();},1);
}

function saveData(returnObj){
  var data={
    vars:uservars,
    code:infield.value,
    input:document.getElementById("input").value,
    showEmoji:showEmoji,
    live:live,
    comp:comp
  };
  localStorage.setItem("userdata",JSON.stringify(data));
  return JSON.parse(JSON.stringify(data));
}

function loadData(obj){
  var data=obj.constructor.name=="Event"?JSON.parse(localStorage.getItem("userdata")):obj;
  console.log(data);
  if (data!=null){
    infield.value=data.code;
    document.getElementById("input").value=data.input;
    for (var i in data.vars){
      document.querySelector("input[data-name="+i+"]").value=data.vars[i];
    }
    uservars=data.vars;
    if (data.showEmoji^showEmoji){toggleMode();}
    if (data.live^live){toggleLive();}
    if (data.comp^comp){toggleComp();}
  }
}

function saveProject(elem){
  var name=document.getElementById("fileinput").value;
  if (name==""){return;}
  if (projects[name]&&elem.innerHTML=="save"){
    elem.innerHTML="save over?";
    return;
  }
  projects[name]={
    data:saveData(true),
    created:new Date().getTime(),
    size:emojiToAscii().length
  };
  elem.innerHTML="save";
  localStorage.setItem("projects",JSON.stringify(projects));
  closeWin(elem);
}

function openProject(elem){
  var name=document.getElementById("fileinput").value;
  if (!projects[name]){return;}
  loadData(projects[name].data);
  closeWin(elem);
  document.getElementById("opline").innerHTML="";
  fillMem();
}

function genFileList(){
  var container=document.getElementById("files");
  container.innerHTML="";
  for (var name in projects){
    var file=document.createElement("div");
    file.className="file";
    file.setAttribute("name",name);
    file.innerHTML="<span>"+name+"</span><span>"+projects[name].size+" characters</span><span>"+new Date(projects[name].created).toLocaleString()+"</span>";
    file.addEventListener("click",function(event){
      document.getElementById("fileinput").value=event.target.getAttribute("name");
      searchFiles();
    });
    container.appendChild(file);
  }
}

function openSaveOpen(type){
  document.getElementById("shadow").style.display="flex";
  var so=document.getElementById("saveopen");
  so.style.display="flex";
  so.setAttribute("type",type);
  document.getElementById("fileinput").value="";
  genFileList();
  searchFiles();
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
  document.getElementById("search").innerHTML=term?".file[name*="+term+"]{display:flex;}":".file{display:flex;}";
  document.getElementsByClassName("sobutton")[0].innerHTML="save";
}

function fillMem(){
  var container=document.getElementById("innermem");
  container.innerHTML="";
  memlen=16*7;
  for (var i=0;i<memlen;i++){
    if (i%16==0){
      addCountSq(Math.floor(i/16));
    }
    var square=document.createElement("div");
    square.className="memsquare";
    square.innerHTML="0";
    container.appendChild(square);
  }
  memsquares=container.getElementsByClassName("memsquare");
}

function hexCellsHigher(){
  var container=document.getElementById("innermem");
  addCountSq(Math.floor((memlen+1)/16));
  for (var i=0;i<16&&memlen+i<uservars.maxmem;i++){
    var square=document.createElement("div");
    square.className="memsquare";
    square.innerHTML="0";
    container.appendChild(square);
  }
  memlen+=16;
  memsquares=container.getElementsByClassName("memsquare");
}

function addCountSq(val){
  var container=document.getElementById("innermem");
  var square=document.createElement("div");
  square.className="countsquare";
  square.innerHTML=val;
  container.appendChild(square);
}
fillMem();
