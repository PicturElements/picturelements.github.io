var moving=false,loadedCM,moveData=null;
var inputData={},inputCount=0;
var cmQueue=[],taQueue={};

//Textarea event delay
var taDelay=null,delay=500;

//--------------SLIDER--------------

function addSlider(parent,name,label,value,min,max,step,changeCallback){
  var wrapper=document.createElement("div");
  wrapper.className="inputitem unfocused";
  wrapper.setAttribute("type","slider");
  parent=addLabel(parent,label);
  var id="input#"+inputCount++;
  wrapper.id=id;
  inputData[id]={
    min:min,
    max:max,
    range:max-min,
    step:step || 1,
    value:value || 0,
    type:"slider",
    item:wrapper,
    moveAction:slideChange,
    name:name,
    getValue:function(){
      return this.value;
    },
    changeCallback:changeCallback
  };
  var data=inputData[id];
  var slider=document.createElement("div");
  slider.className="sliderbox";
  slider.addEventListener("mousedown",setSlider);
  slider.addEventListener("touchstart",setSlider);
  var input=document.createElement("input");
  input.className="slidertext";
  input.addEventListener("click",function(){
    data.value=this.value;
    updateValue(data);
  });
  input.addEventListener("change",function(){
    data.value=this.value;
    updateValue(data);
  });
  input.type="number";
  var bar=document.createElement("div");
  bar.className="sliderbar";
  var nub=document.createElement("div");
  nub.className="slidernub";
  bar.appendChild(nub);
  slider.appendChild(bar);
  wrapper.appendChild(input);
  wrapper.appendChild(slider);
  parent.appendChild(wrapper);
  var invalid=isNaN(data.value)||data.value<data.min||data.value>data.max;
  if (invalid) data.value=data.min;
  updateValue(id,invalid);
  return data;
}

function setSlider(evt){
  moveData=elementToData(evt.target);
  moving=true;
  slideChange(evt);
}

function slideChange(evt){
  var rect=moveData.item.getElementsByClassName("sliderbar")[0].getBoundingClientRect();
  var val=((evt.clientX || evt.touches[0].clientX)-rect.left)/rect.width*moveData.range+moveData.min;
  moveData.value=val;
  updateValue(moveData);
}

//--------------SLIDER WITH RADIOS--------------

function addSliderRadio(parent,name,label,value,min,max,step,options,changeCallback){
  var par=addSlider(parent,name,label,value,min,max,step,changeCallback);
  var child=addChildInput(par.item,["radio",options[0],options.slice(1)],par,value);
  par.childInput=child;
  return child;
}

//--------------RADIO BUTTONS--------------

function addRadio(){
  var args=[false].concat([].slice.call(arguments));
  return addRadioBool.apply(this,args);
}

function addRadioBool(isBool,parent,name,label,value,options,changeCallback){
  var wrapper=document.createElement("div");
  wrapper.className="inputitem unfocused";
  wrapper.setAttribute("type","radio");
  parent=addLabel(parent,label);
  var id="input#"+inputCount++;
  wrapper.id=id;
  inputData[id]={
    value:value,
    type:isBool?"boolean":"radio",
    item:wrapper,
    name:name,
    options:options,
    getValue:function(){
      var pf=parseFloat(this.value);
      return isNaN(pf)?this.value:pf;
    },
    changeCallback:changeCallback
  };
  var data=inputData[id];
  var toggle=document.createElement("div");
  toggle.className="togglebar";
  for (var i=0;i<options.length;i++){
    var option=document.createElement("div");
    option.className="toggleitem";
    if (options[i]==value){
      option.classList.add("selected");
      propagateUnfocus(data);
    }
    option.setAttribute("data-value",options[i]);
    if (isBool) i++;
    option.innerHTML=options[i];
    option.addEventListener("click",setRadio);
    toggle.appendChild(option);
  }
  wrapper.appendChild(toggle);
  parent.appendChild(wrapper);
  return data;
}

function setRadio(){
  var wrapper=getParent(this,"inputitem");
  var obj=elementToData(wrapper);
  obj.value=this.getAttribute("data-value");
  var items=wrapper.getElementsByClassName("toggleitem");
  for (var i=0;i<items.length;i++){
    items[i].classList.remove("selected");
    if (items[i]==this){
      this.classList.add("selected");
      propagateUnfocus(obj);
    }
  }
  sendEvent(obj);
}

//--------------BOOLEAN BUTTONS--------------

//arguments: parent,name,label,value,options,childInput,parentInput
function addBoolean(){
  var args=[true].concat([].slice.call(arguments));
  return addRadioBool.apply(this,args);
}

//--------------MULTIPLE CHOICE--------------

function addMulti(parent,name,label,value,options,changeCallback){
  var wrapper=document.createElement("div");
  wrapper.className="inputitem unfocused";
  wrapper.setAttribute("type","multi");
  parent=addLabel(parent,label);
  var id="input#"+inputCount++;
  wrapper.id=id;
  inputData[id]={
    type:"multi",
    item:wrapper,
    name:name,
    getValue:function(){
      var elems=this.item.getElementsByClassName("selected"),out=[];
      for (var i=0;i<elems.length;i++){
        out.push(elems[i].getAttribute("data-value"));
      }
      //CHANGE THIS IF NEEDED
      //return JSON.stringify(out);
      return out;
    },
    changeCallback:changeCallback
  };
  var data=inputData[id];
  var toggle=document.createElement("div");
  toggle.className="togglebar";
  var vc=0;   //value counter
  for (var i=0;i<options.length;i++){
    var option=document.createElement("div");
    option.className="toggleitem";
    if (options[i]==value[vc]){
      option.classList.add("selected");
      propagateUnfocus(data);
      vc++;
    }
    option.setAttribute("data-value",options[i]);
    option.innerHTML=options[i];
    option.addEventListener("click",setMulti);
    toggle.appendChild(option);
  }
  wrapper.appendChild(toggle);
  parent.appendChild(wrapper);
  return data;
}

function setMulti(){
  if (this.classList.contains("selected")){
    this.classList.remove("selected");
  }else{
    this.classList.add("selected");
  }
  var obj=elementToData(this);
  propagateUnfocus(obj);
  sendEvent(obj);
}

//--------------TEXTAREA--------------

function addTextarea(parent,name,label,value,lang,changeCallback){
  var wrapper=document.createElement("div");
  wrapper.className="inputitem";
  wrapper.setAttribute("type","textarea");
  addLabel(parent,label);
  parent=document.getElementsByClassName("inputwrapper")[0];
  var id="input#"+inputCount++;
  wrapper.id=id;
  var area=document.createElement("textarea");
  area.className="codearea";
  area.value=value;
  wrapper.appendChild(area);
  inputData[id]={
    value:value,
    type:"textarea",
    lang:lang,
    item:wrapper,
    textarea:area,
    name:name,
    moveAction:resizeArea,
    getValue:function(){
      return this.cm?this.cm.getValue():"";
    },
    changeCallback:changeCallback
  };
  var bar=document.createElement("div");
  bar.className="resizebar";
  bar.addEventListener("mousedown",setMovable);
  bar.addEventListener("touchstart",setMovable);
  wrapper.appendChild(bar);
  parent.appendChild(wrapper);
  addCM(inputData[id]);
  return inputData[id];
}

function addLabel(parent,str){
  if (!str) return parent;
  var newParent=getParent(parent,"inputwrapper");
  var label=document.createElement("div");
  label.className="lbl";
  if (newParent!=parent) label.classList.add("noline");
  parent=newParent;
  label.innerHTML=str;
  parent.appendChild(label);
  return parent
}

function resizeArea(evt){
  var rect=moveData.item.getElementsByClassName("CodeMirror")[0].getBoundingClientRect();
  var offs=moveData.item.getElementsByClassName("resizebar")[0].offsetHeight/2;
  moveData.item.style.height=((evt.clientY || evt.touches[0].clientY)-rect.top-offs)+"px";
}

function updateValue(key,invalid){
  var obj=(typeof key=="string")?inputData[key]:key;
  if (obj.type=="slider"){
    scaleVal(obj);
    obj.item.getElementsByClassName("slidernub")[0].style.left=((obj.value-obj.min)/obj.range)*100+"%";
    obj.item.getElementsByClassName("slidertext")[0].value=obj.value;
    sendEvent(obj);
    if (invalid) return;
  }
  propagateUnfocus(obj);
}

function sendEvent(obj,forceCheck){
  var parent=getParentInput(obj),
      val=obj.getValue(),
      oldPV=parent.getValue();
  if (forceCheck||parent.oldValue!=undefined&&obj.type!="textarea"){
    if (oldPV==parent.oldValue) return;
  }
  var evt=document.createEvent("Event");
  evt.initEvent("inputchange",true,true);
  evt.value=val;
  evt.literalValue=getDisplayedValue(parent,val);
  evt.referenceObject=obj;
  evt.parentObject=parent;
  evt.name=parent.name;
  obj.item.dispatchEvent(evt);
  if (parent.changeCallback) parent.changeCallback(parent,evt);
  parent.oldValue=oldPV;
}

function propagateUnfocus(obj){
  obj.item.classList.remove("unfocused");
  propagateUp(obj);
  propagateDown(obj);
}

function propagateUp(obj){
  if (obj.parentInput){
    obj.parentInput.item.classList.add("unfocused");
    obj.parentInput.value=obj.getValue();
    propagateUp(obj.parentInput);
  }
}

function propagateDown(obj){
  if (obj.childInput){
    obj.childInput.item.classList.add("unfocused");
    propagateDown(obj.childInput);
  }
}

function scaleVal(obj){
  var val=Math.round(obj.value/obj.step)*obj.step;
  val=Math.min(Math.max(val,obj.min),obj.max);
  obj.value=sigAdjust(obj.step,val);
}

function setMovable(){
  moving=true;
  moveData=elementToData(this);
  propagateUnfocus(moveData);
}
  
function getParent(elem,cls){
  while(true){
    if (elem.classList.contains(cls)) return elem;
    if (elem.tagName=="HTML") return null;
    elem=elem.parentElement;
  }
}

function elementToData(elem){
  return inputData[getParent(elem,"inputitem").id];
}

document.body.addEventListener("mousemove",function(event){move(event);});
document.body.addEventListener("touchmove",function(event){move(event);});
document.body.addEventListener("mouseup",release);
document.body.addEventListener("touchend",release);

function move(evt){
  if (moving){
    moveData.moveAction(evt);
  }
}

function release(){
  moving=false;
}

function addCM(obj){
  if (!loadedCM){
    cmQueue.push(obj);
    if (cmQueue.length>1) return;
    var script=document.createElement("script");
    script.src="https://picturelements.github.io/libraries/codemirror/codemirror.js";
    document.body.appendChild(script);
    script.onload=function(){
      cmQueue.forEach(function(o){
        addLang(o);
      });
      loadedCM=true;
    };
  }else{
    addLang(obj);
  }
}

function addLang(obj){
  var langObj=taQueue[obj.lang];
  if (langObj!="loaded"){
    if (!langObj) langObj=[];
    langObj.push(obj);
    if (langObj.length>1) return;
    var script=document.createElement("script");
    script.src="https://picturelements.github.io/libraries/codemirror/cm-"+obj.lang+".js";
    document.body.appendChild(script);
    script.onload=function(){
      langObj.forEach(function(o){
        createTA(o);
      });
      langObj="loaded";
    };
  }else{
    createTA(obj);
  }
}

function createTA(obj){
  var code=CodeMirror.fromTextArea(obj.textarea,{
    lineNumbers:true,
    lineWrapping:true,
    mode:"text/x-"+obj.lang
  });
  obj.cm=code;
  code.on("change",function(){
    propagateUnfocus(obj);
    clearTimeout(taDelay);
    taDelay=setTimeout(function(){
      sendEvent(obj);
    },delay);
  });
  code.display.wrapper.addEventListener("click",function(){
    propagateUnfocus(obj);
    sendEvent(obj,true);
  });
}

//Because IE is so retarded it doesn't even have log10...
Math.log10=function(val){
  return Math.log(val)/Math.log(10);
};

function sigAdjust(basis,val){
	var sigfigs=Math.ceil(Math.log10(Math.abs(val)+1))+((""+basis).split(".")[1] || "").length;
  if (!sigfigs) return val;
	return parseFloat(val.toPrecision(sigfigs));
}

var add={
  slider:addSlider,
  radio:addRadio,
  boolean:addBoolean,
  multi:addMulti,
  textarea:addTextarea,
  sliderradio:addSliderRadio
};

function generateForm(data,addTo){
  addTo.classList.add("inputwrapper");
  var vals=[];
  for (var i=0;i<data.length;i++){
    if (Array.isArray(data[i][0])){
      var value=data[i][0][3];
      var parent=add[data[i][0][0]].apply(this,[addTo].concat(data[i][0].slice(1)));
      for (var n=1;n<data[i].length;n++){
        var child=addChildInput(parent.item,data[i][n],parent,value);
        parent.childInput=child;
        parent=child;
      }
      getParentInput(parent).oldValue=value;
    }else{
      var input=add[data[i][0]].apply(this,[addTo].concat(data[i].slice(1)));
      getParentInput(input).oldValue=data[i][3];
    }
  }
}

function getParentInput(elem){
  while (elem.parentInput){
    elem=elem.parentInput;
  }
  return elem;
}

function getDisplayedValue(elem,value){
  while (elem.item.classList.contains("unfocused")){
    if (!elem.childInput) break;
    elem=elem.childInput;
  }
  if (elem.type=="boolean"){
    for (var i=0;i<elem.options.length;i++){
      if (elem.options[i]==value) return elem.options[i+1];
    }
  }else if (elem.type=="multi"){
    if (typeof value!="string") return JSON.stringify(value);
  }
  return value;
}

function addChildInput(parent,data,par,value){
  var child=add[data[0]].apply(this,[parent,"hidden",data[1],(value || par.value)].concat(data.slice(2)));
  child.parentInput=par;
  if (!child.item.classList.contains("unfocused")) propagateUnfocus(child);
  return child;
}
