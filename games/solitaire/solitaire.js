cardSvg={
  hearts: [['l',10,-1],['l',-10,12],['l',-10,-12],['c',-5,-10,10,-10,10,-3],['c',0,-7,15,-7,10,3]],
  clubs: [['c',-15,-15,15,-15,0,0],['c',13,-15,13,15,0,0],['l',3,7],['l',-6,0],['l',3,-7],['c',-13,15,-13,-15,0,0]],
  diamonds: [['l',0,-11],['l',10,11],['l',-10,11],['l',-10,-11],['l',10,-11]],
  spades: [['c',-3,8,-14,4,-10,-2],['l',10,-10],['l',10,10],['c',4,6,-7,10,-10,2],['l',3,7],['l',-6,0],['l',3,-7]]
};

var cardDistribution=[
  [[],[0.2,0.8]],
  [[],[0.2,0.5,0.8]],
  [[0.2,0.8],[]],
  [[0.2,0.8],[0.5]],
  [[0.2,0.5,0.8],[]],
  [[0.2,0.5,0.8],[0.35]],
  [[0.2,0.5,0.8],[0.35,0.65]],
  [[0.2,0.4,0.6,0.8],[0.5]],
  [[0.2,0.4,0.6,0.8],[0.3,0.7]]
];

var cardSpacing=[0.3,0.5,0.7];

var cards=[],cardsPlaced=0,cardNo=52,maxDeal=Infinity;
var parentPile=null,moveElem=null,offsX,offsY,movedElem=false,noAction=false;
var pickupCoords={};

//runtime variables
var redeals=0,maxRedeals=0,time,tick=null,interruptTime,moves;
var checks,maxStack,autoP,currentGame;

var gameMode="klondike";

document.body.addEventListener("mousemove",function(event){
  moveCards(event);
});

document.body.addEventListener("mouseup",function(event){
  dropCards(event);
});

window.onresize=setHeapSpacing;

function moveCards(evt){
  if (moveElem&&!noAction){
    moveElem.style.left=(evt.clientX-offsX)+"px";
    moveElem.style.top=(evt.clientY-offsY)+"px";
    movedElem=true;
  }
}

function setupGame(type){
  var gc=document.getElementById("gamecontainer");
  gc.innerHTML="";
  var game=solitaires[type],critArr=[],deckInfo=null;
  
  //set variables to default
  redeals=0;
  moves=-1;
  var extraClass="",heapCount=0;
  
  //setup variables
  var viewup=game.cardinfo.viewmode=="up";
  maxRedeals=game.generalinfo.redeals;
  checks=game.generalinfo.checks;
  maxStack=game.generalinfo.maxstack || Infinity;
  autoP=game.generalinfo.autoplace;
  if (game.generalinfo.size) document.getElementById("gamecontainer").style.fontSize=game.generalinfo.size+"em";
  
  //general setup
  document.getElementById("gamename").innerHTML=game.name;
  setupCards(game.cardinfo.cardcount);
  shuffleCards();
  incMoves();
  currentGame=type;
  setTick();
  
  //here be dragons
  for (var i=0;i<game.board.length;i++){
    var bar=document.createElement("div");
    bar.className="contentbar";
    var inner=document.createElement("div");
    inner.className="innerwrapper";
    extraClass="";
    for (var n=0;n<game.board[i].length;n++){
      var obj=game.board[i][n];
      var place=document.createElement("div");
      
      if (obj.vardef){
        for (var a in obj.vardef){
          if (a=="criteria") critArr=obj.vardef.criteria.split("|");
        }
        extraClass=obj.vardef.addclass || "";
        continue;
      }
      
      var tmpExtraClass=obj.addclass || extraClass;
      if (obj.type=="deck"||obj.type=="deckdump"||obj.type=="collection"){
        place.className="pile"
        if (obj.type=="deck"){
          deckInfo=obj;
          place.classList.add("deck","noplace");
          if (obj.mode=="packets") place.classList.add("packets");
          place.setAttribute("redealable",redeals<maxRedeals);
          place.appendChild(createBottomCard());
          (function(cm,dm){
            place.addEventListener("click",function(event){cyclePile(cm,dm,event)});
          })(obj.mode,(obj.dealcount||0));
        }
        else if (obj.type=="deckdump"){
          place.classList.add("dump","noplace");
          if (obj.display){
            var attr="";
            for (var m=2;m<=obj.display;m++){attr+=m;}
            place.setAttribute("display",attr);
          }
          place.appendChild(createBottomCard());
        }
        else if (obj.type=="collection"){
          place.classList.add("collection");
          var bottomCard=document.createElement("div");
          bottomCard.className="card bottom";
          var ca=obj.criteria?obj.criteria.split("|"):critArr;
          if (ca[4]=="auto"){place.classList.add("noplace","notake");}
          setCriteria(bottomCard,ca);
          place.appendChild(bottomCard);
        }
      }else if (obj.type=="heap"||obj.type=="rest"){
        place.className="cardwrapper base";
        var baseCard=createBottomCard();
        var ca=obj.criteria?obj.criteria.split("|"):critArr;
        setCriteria(baseCard,ca);
        place.appendChild(baseCard);
        if (obj.type=="heap"){
          addHeap(place,obj.startsize,!viewup,ca);
          place.id="heap_"+heapCount;
          heapCount++;
          bar.classList.add("heapspace");
        }else{
          place.className="pile rest";
        }
      }else if (obj.type=="invisible") place.className="invisible";
      
      if (tmpExtraClass) place.classList.add(tmpExtraClass);
      //inner.append(place);
      bar.appendChild(place);
    }
    gc.appendChild(bar);
  }
  
  //add rest of cards into deck
  var deck=document.getElementsByClassName("deck");
  if (deck.length>0&&deckInfo){
    //create packets of cards
    if (deckInfo.mode=="packets"){
      while (cardsPlaced<cardNo){
        var packet=document.createElement("div");
        packet.className="packet";
        for (var i=0;i<deckInfo.packetsize&&cardsPlaced<cardNo;i++){
          packet.appendChild(createCard(true,critArr));
        }
        packet.addEventListener("click",function(event){
          distributePacket(event);
        });
        deck[0].appendChild(packet);
      }
    }else{
      while (cardsPlaced<cardNo){
        deck[0].appendChild(createCard(true,critArr));
      }
    }
  }
  flipTopCards();
  setAllMovable();
  setHeapSpacing(true);
}

function createBottomCard(){
  var card=document.createElement("div");
  card.className="card bottom";
  return card;
}

function setCriteria(card,critArr){
  card.setAttribute("data-value",critArr[0]);
  card.setAttribute("data-order",critArr[1]);
  card.setAttribute("data-direction",critArr[2]);
  card.setAttribute("data-suit",critArr[3]);
}

function cloneCriteria(card,card2,pile){
  card.setAttribute("data-order",card2.getAttribute("data-order"));
  card.setAttribute("data-direction",card2.getAttribute("data-direction"));
}

function setupCards(deck){
  cardsPlaced=0;
  cardNo=0;
  cards=[];
  for (var i=0;i<4;i++){
    var count=deck[i]==undefined?deck[0]:deck[i];
    for (var n=0;n<count;n++){
      cards.push({
        suit:i,
        value:n%13+1
      });
      cardNo++;
    }
  }
}

function shuffleCards(){
  for (var i=0;i<cards.length;i++){
    var rand=Math.floor(Math.random()*cards.length);
    var tmp=cards[rand];
    cards[rand]=cards[i];
    cards[i]=tmp;
  }
}

function addHeap(elem,count,hidden,ca){
  for (var i=0;i<count;i++){
    var wrapper=document.createElement("div");
    wrapper.className="cardwrapper";
    var card=createCard(hidden,ca);
    if (!card) return;
    wrapper.appendChild(card);
    elem.appendChild(wrapper);
    elem=wrapper;
  }
}

function createCard(hidden,ca){
  if (cardsPlaced>=cardNo) return;
  var card=document.createElement("div");
  card.className="card";
  card.setAttribute("data-index",cardsPlaced++);
  setCriteria(card,ca);
  if (ca[5]) card.setAttribute(ca[5],ca[6]);
  if (hidden){
    flipBack(card);
    card.setAttribute("data-value",-1);
  }else{
    flipCard(card,true);
  }
  card.addEventListener("mousedown",function(event){pickupCard(event);});
  return card;
}

function flipCard(card,forceFlip){
  if (!card) return;
  if (card.classList.contains("hidden")||forceFlip){
    card.classList.remove("hidden");
    var obj=cards[card.getAttribute("data-index")];
    card.setAttribute("data-value",obj.value);
    card.setAttribute("data-suit",obj.suit);
    addCardContent(card,obj.value,obj.suit);
  }
}

function flipBack(card){
  if (!card) return;
  if (!card.classList.contains("hidden")){
    card.classList.add("hidden");
    card.innerHTML=document.getElementById("reversebuffer").innerHTML;
  }
}

function flipTopCards(){
  var heaps=document.getElementsByClassName("cardwrapper base");
  for (var i=0;i<heaps.length;i++){
    flipCard(getTopCard(heaps[i]));
  }
}

function addCardContent(card,value,suit){
  card.innerHTML="";
  var span=document.createElement("span");
  span.innerHTML=idToValue(value);
  card.appendChild(span);
  card.appendChild(span.cloneNode(true));
  var svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox","0 0 70 100");
  if (value==1){
    svg.appendChild(addSuit(0.5,0.5,suit,2));
  }else if (value<11){
    var arr=cardDistribution[value-2];
    for (var i=0;i<arr.length;i++){
      for (var n=0;n<arr[i].length;n++){
        if (i==0){
          svg.appendChild(addSuit(cardSpacing[0],arr[i][n],suit,0.8));
          svg.appendChild(addSuit(cardSpacing[2],arr[i][n],suit,0.8));
        }else{
          svg.appendChild(addSuit(cardSpacing[i],arr[i][n],suit,0.8));
        }
      }
    }
  }else{
    svg.innerHTML=document.getElementById("powerbuffer_"+value).innerHTML;
  }
  svg.appendChild(addSuit(0.075,0.17,suit,0.35));
  svg.appendChild(addSuit(0.925,0.83,suit,0.35,true));
  card.appendChild(svg);
}

function idToValue(val){
  var vals=['A',2,3,4,5,6,7,8,9,10,'J','Q','K'];
  return vals[val-1];
}

function addSuit(x,y,suit,zoom,flip){
  var path=document.createElementNS("http://www.w3.org/2000/svg","path");
  var dir=flip?-1:1;
  var d="M"+round(70*x)+" "+round(100*y+(suit%2==1?2.2:0)*zoom*dir);
  var arr=cardSvg[Object.keys(cardSvg)[suit]];
  for (var i=0;i<arr.length;i++){
    d+=arr[i][0]+" ";
    for (var n=1;n<arr[i].length;n++){
      d+=round(arr[i][n]*zoom*(n%2==0?dir:1))+" ";
    }
  }
  path.setAttribute("d",d);
  return path;
}

function round(val){
  var roundTo=2,pow=Math.pow(10,roundTo);
  return Math.round(val*pow)/pow;
}

function pickupCard(evt){
  if (moveElem||noAction) return;
  //Pick up card, and if it's bounded by a wrapper, pick that up.
  moveElem=evt.target.parentElement.classList.contains("cardwrapper")?evt.target.parentElement:evt.target;
  var bcr=moveElem.getBoundingClientRect();
  offsX=evt.clientX-bcr.left;
  offsY=evt.clientY-bcr.top;
  
  pickupCoords={
    x:bcr.left,
    y:bcr.top
  }
  //console.log(offsX+" - "+offsY);
  moveCards(evt);
  parentPile=getParentPile(moveElem);
  movedElem=false;
  moveElem.classList.add("moving");
  evt.stopPropagation();
}

function dropCards(evt){
  if (moveElem&&!noAction){
    var pp=getOverlappingPile(moveElem);
    if (pp&&pp!=parentPile){
      if (canPlace(getTopCard(pp),getBottomCard(moveElem))){
        relayAppend(pp,moveElem,200,"sliding");
        return;
      }
    }else if (!movedElem){
      if (!autoPlace(evt)) slideBack();
      return;
    }
    slideBack();
  }
}

function slideBack(){
  noAction=true;
  moveElem.classList.add("sliding");
  setTimeout(function(){
    moveElem.style.left=pickupCoords.x+"px";
    moveElem.style.top=pickupCoords.y+"px";
  },10);
  setTimeout(function(){
    resetCardPos();
    noAction=false;
  },200);
}

function getOverlappingPile(elem){
  var maxPile=null,maxArea=0;
  //EGADS
  var elements=[].slice.call(document.getElementsByClassName("pile")).concat([].slice.call(document.getElementsByClassName("cardwrapper base")));
  for (var i=0;i<elements.length;i++){
    if (elements[i]!=parentPile&&!elements[i].classList.contains("noplace")){
      var compareCard=getTopCard(elements[i]);
      if (!compareCard) continue;
      var area=overlap(compareCard,elem);
      if (area>maxArea){
        maxArea=area;
        maxPile=elements[i];
      }
    }
  }
  return maxPile;
}

function canPlace(tc,bc){
  var tcp=getParentPile(tc),bcl=getPileLength(bc);
  //some no-no's
  if (!tc||!bc||tcp.classList.contains("noplace")||tc.classList.contains("hidden")) return false;
  if (bcl>1){
    if (!canCollapse(bc,tc)) return false;
  }
  
  //no rest piles may have more than one card in them
  if (tcp.classList.contains("rest")&&(tcp.children.length==2||bcl>1)) return false;
  
  var tcVal=parseInt(tc.getAttribute("data-value")),bcVal=parseInt(bc.getAttribute("data-value"));
  var tcSuit=tc.getAttribute("data-suit"),bcSuit=parseInt(bc.getAttribute("data-suit"));
  var dir=tc.getAttribute("data-direction"),ascending=dir=="asc";
  var order=tc.getAttribute("data-order");
  var alternating=order=="alternate";
  
  //assume that allowing a card of any value to be placed on a square/card means anything goes
  if (tc.getAttribute("data-value")=="any") return true;
  //check if the cards are directly in asc/desc order
  if (Math.abs(tcVal-bcVal)>1||tcVal==bcVal) return false;
  //check if cards are stacked in the correct order
  if (((tcVal<bcVal)^ascending)&&dir!="any") return false;
  //check if cards are alternating/have the same suit
  if (tcSuit=="any"||order=="consec"||tc.getAttribute("anysuit")=="true") return true;   //if the cards have passed all other tests up until this point, this must be true.
  if ((alternating&&tcSuit%2==bcSuit%2)||!alternating&&tcSuit!=bcSuit) return false;
  return true;
}

function canCollapse(tc,bc){
  //Concept: if there's a heap of cards where specific inherent properties are different
  //than the target pile's, that must mean the heap cannot be placed on the other.
  //Any details such as whether the card pattern will continue after appending will
  //be dealt with by canPlace.
  if (tc.getAttribute("data-order")!=bc.getAttribute("data-order")&&tc.getAttribute("data-order")!="consec") return false;
  if (tc.getAttribute("data-direction")!=bc.getAttribute("data-direction")) return false;
  return true;
}

function getPileLength(card){
  var parent=card.parentElement;
  return parent.classList.contains("pile")?1:parent.getElementsByClassName("card").length;
}

function getParentPile(elem){
  if (!elem) return null;
  while (elem.tagName!="BODY"){
    var cl=elem.classList;
    if (cl.contains("base")||cl.contains("pile")) return elem;
    elem=elem.parentElement;
  }
  return null;
}

function getTopCard(pile){
  var cards=pile.getElementsByClassName("card");
  return cards[cards.length-1];
}

function getBottomCard(pile){
  return pile.classList.contains("card")?pile:pile.getElementsByClassName("card")[0];
}

function relayAppend(target,cards,speed,extraClass){
  incMoves();
  noAction=true;
  cardToMoving(cards);
  speed=speed || 200;
  var dummy=document.createElement("div");
  dummy.className="card dummy";
  appendCards(target,dummy,true);
  var bcr=dummy.getBoundingClientRect();
  if (dummy.parentElement.classList.contains("cardwrapper")) dummy=dummy.parentElement;
  dummy.parentElement.removeChild(dummy);
  setTimeout(function(){
    if (extraClass) cards.classList.add(extraClass);
    cards.style.left=bcr.left+"px";
    cards.style.top=bcr.top+"px";
  },10);
  setTimeout(function(){
    noAction=false;
    appendCards(target,cards,false);
  },speed);
}

function appendCards(target,cards,noReset){
  var mElem=cards,pp,src=cards.parentElement;
  if (!noReset) pp=getParentPile(target);
  if (target.classList.contains("cardwrapper")){
    if (cards.classList.contains("card")){
      var wrapper=document.createElement("div");
      wrapper.className="cardwrapper";
      wrapper.appendChild(cards);
      cards=wrapper;
    }
    getTopCard(target).parentElement.appendChild(cards);
  }else{
    collapseHeap(target,cards);
  }
  if (noReset) return;
  
  clonePile(target);
  flipTopCards();
  resetCardPos(mElem);
  checkCollectionFull();
  checkCards();
  setMovable(pp);
  setMovable(src);
  setHeapSpacing();
}

function setMovable(elem){
  var pp=getParentPile(elem),count=1;
  if (pp.classList.contains("pile")) return;
  var cards=[].slice.call(pp.getElementsByClassName("card"));
  cards.forEach(function(elm){
    elm.parentElement.classList.remove("cmovable");
  });
  for (var i=cards.length-1;i>0;i--){
    //look below to see what this does
    var block=isNaN(maxStack)?!checkConditions(cards[i-1],cards[i]):count>=maxStack;
    if (!canPlace(cards[i-1],cards[i])||block){
      cards[i-1].parentElement.classList.add("cmovable");
      return;
    }
    count++;
  }
  pp.classList.add("cmovable");
}

//Checks additional conditions with visible cards, i.e. if two cards share specific properties, such
//as same suit. Makes it so that decisions can be made whether a valid movable block can be made out of a 
//sequence of cards.
function checkConditions(c1,c2){
  for (var key in maxStack){
    var check=maxStack[key],same=key=="same";
    for (var i=0;i<check.length;i++){
      if ((c1.getAttribute("data-"+check[i])==c2.getAttribute("data-"+check[i]))^same) return false;
    }
  }
  return true;
}

function setAllMovable(){
  var heaps=document.getElementsByClassName("cardwrapper base");
  for (var i=0;i<heaps.length;i++){
    setMovable(heaps[i]);
  }
}

function setHeapSpacing(noAnim){
  var heaps=document.getElementsByClassName("cardwrapper base");
  if (heaps.length==0) return;
  var cardHeight=document.getElementsByClassName("card")[0].offsetHeight,marginSpace=heaps[0].parentElement.offsetHeight-cardHeight;
  if (!noAnim) document.body.classList.add("slideheap");
  var css="";
  for (var i=0;i<heaps.length;i++){
    var cardCount=heaps[i].getElementsByClassName("card").length-2;
    if (cardCount<1) continue;
    var margin=Math.min(Math.max(Math.floor(marginSpace/cardCount),10),cardHeight/3);
    css+="#heap_"+i+" > .cardwrapper .cardwrapper {";
    css+="margin-top:"+margin+"px";
    css+="}\n";
  }
  document.getElementById("customstyle").innerHTML=css;
  setTimeout(function(){
    document.body.classList.remove("slideheap");
  },200);
}

function resetCardPos(cards){
  cards=cards || moveElem;
  if (cards){
    cards.classList.remove("moving");
    cards.removeAttribute("style");
    cards.classList.remove("sliding");
    cards.classList.remove("collapse");
    moveElem=null;
    parentPile=null;
  }
}

function checkCollectionFull(){
  var collections=document.getElementsByClassName("collection"),count=0;
  for (var i=0;i<collections.length;i++){
    count+=(collections[i].children.length-1);
  }
  if (count==cardNo) animateWin();
}

function animateWin(){
  var cards=document.querySelectorAll(".card:not(.bottom)");
  var padding=cards[0].offsetHeight/2;
  setTimeout(function(){
    for (var i=0;i<cards.length;i++){
      (function(index){
        setTimeout(function(){
          cardToMoving(cards[index]);
        },index*50);
        setTimeout(function(){
          cards[index].classList.add("winning");
          cards[index].style.left=Math.floor(Math.random()*(window.innerWidth-padding*2)+padding)+"px";
          cards[index].style.top=Math.floor(Math.random()*(window.innerHeight-padding*2)+padding)+"px";
          cards[index].style.transform="rotate("+(Math.random()*180-90)+"deg)";
        },index*50+20);
      })(i);
    }
  },500);
}

function cardToMoving(card){
  var bcr=card.getBoundingClientRect();
  card.classList.add("moving");
  card.style.left=Math.floor(bcr.left)+"px";
  card.style.top=Math.floor(bcr.top)+"px";
}

function checkCards(){
  if (checks=="none") return;
  //First atrocity: 
  if (checks=="flush"){
    var heaps=document.getElementsByClassName("cardwrapper base");
    
    main:
    for (var i=0;i<heaps.length;i++){
      var cards=heaps[i].getElementsByClassName("card");
      if (cards.length>13){
        var val=1,count=13;
        for (var n=cards.length-1;n>0;n--){
          if (cards[n].getAttribute("data-value")!=val) continue main;
          val++;
          count--;
          if (count==0){
            moveElem=cards[n].parentElement;
            break;
          }
        }
        var collections=document.getElementsByClassName("collection");
        for (var n=0;n<collections.length;n++){
          if (collections[n].children.length==1){
            cardToMoving(moveElem);
            relayAppend(collections[n],moveElem,450,"collapse");
            return;
          }
        }
      }
    }
  }
}

function collapseHeap(target,wrapper){
  if (wrapper.classList.contains("card")){
    target.appendChild(wrapper);
  }else{
    var toDelete=wrapper;
    while (true){
      target.appendChild(wrapper.getElementsByClassName("card")[0]);
      wrapper=wrapper.getElementsByClassName("cardwrapper")[0];
      if (!wrapper) break;
    }
    toDelete.parentElement.removeChild(toDelete);
  }
  clonePile(target);
}

function clonePile(elem){
  var pile=getParentPile(elem);
  var cards=pile.getElementsByClassName("card");
  for (var i=1;i<cards.length;i++){
    cloneCriteria(cards[i],cards[0],pile);
  }
}

function overlap(elem,elem2){
  var rect=elem.getBoundingClientRect(),rect2=elem2.getBoundingClientRect();
  var top=Math.max(rect.top,rect2.top),bottom=Math.min(rect.bottom,rect2.bottom);
  var left=Math.max(rect.left,rect2.left),right=Math.min(rect.right,rect2.right);
  if (top>bottom||left>right) return 0;
  return (right-left)*(bottom-top);
}

function cyclePile(cm,dc,evt){
  if (noAction) return;
  var deck=evt.target;
  var dump=document.getElementsByClassName("dump")[0];
  if (cm=="heap"){
    dump=document.getElementsByClassName("collection")[0];
    cm="normal";
  }
  if (cm=="normal"){
    var card=deck.children[1];
    if (!card){
      if (redeals>=maxRedeals) return;
      var cards=dump.children,len=cards.length;
      for (var i=1;i<len;i++){
        flipBack(cards[1]);
        deck.appendChild(cards[1]);
      }
      redeals++;
      deck.setAttribute("redealable",redeals<maxRedeals);
    }
    for (var i=0;i<dc;i++){
      card=deck.children[i+1];
      if (!card) break;
      flipCard(card);
      relayAppend(dump,card,270,"sliding");
    }
  }
}

function distributePacket(evt){
  var packet=evt.target;
  packet.style.cssText="box-shadow:none !important";
  var cards=[].slice.call(packet.children);
  cards.forEach(function(card){   //no arrow notation because IE
    flipCard(card);
  });
  var heaps=document.getElementsByClassName("cardwrapper base");
  for (var i=0;i<cards.length;i++){
    relayAppend(heaps[i%heaps.length],cards[i],430,"collapse");
  }
  setTimeout(function(){
    packet.parentElement.removeChild(packet);
  },450);
}

function autoPlace(evt){
  if (!autoP) return false;
  var cards=evt.target,actElem=null;
  //cards is ALWAYS a .card element. If it's not, this will break.
  if (cards.parentElement.classList.contains("cardwrapper")) cards=cards.parentElement;
  var bc=getBottomCard(cards);
  
  var elems=getPriorityList();
  
  for (var i=0;i<elems.length;i++){
    if (canPlace(getTopCard(elems[i]),bc)){
      if (!actElem||actElem.classList.contains("collection")) actElem=elems[i];
      if (elems[i].children.length>1||elems[i].classList.contains("collection")) break;
    }
  }
  if (actElem){
    relayAppend(actElem,cards,200,"sliding");
    evt.stopPropagation();
    return true;
  }
  return false;
}

function getPriorityList(){
  //This monster creates an array of elements ordered in decreasing priority
  return [].slice.call(document.getElementsByClassName("collection")).concat([].slice.call(document.getElementsByClassName("cardwrapper base")).concat([].slice.call(document.getElementsByClassName("rest"))));
}

//UI stuff
function setTick(){
  clearInterval(tick);
  time=new Date().getTime();
  tick=setInterval(timeCount,1000);
  timeCount();
}

function timeCount(){
  var timeOut="",newTime=(new Date().getTime()-time)/1000;
  if (newTime>=3600){
    timeOut=addZeroes(newTime/3600)+":";
    newTime%=3600;
  }
  timeOut+=addZeroes(newTime/60)+":";
  newTime%=60;
  timeOut+=addZeroes(newTime);
  document.getElementById("time").innerHTML=timeOut;
}

function addZeroes(inp){
  inp=Math.floor(inp)
  return inp<10?"0"+inp:inp;
}

function incMoves(){
  moves++;
  document.getElementById("movecount").innerHTML=moves;
}

function toggleAction(){
  var expanded=document.body.getAttribute("expanded")=="true";
  if (expanded){
    time+=(new Date().getTime()-interruptTime);
    timeCount();
  }else{
    interruptTime=new Date().getTime();
  }
  document.body.setAttribute("expanded",!expanded);
}

function fillShowcase(){
  var sc=document.getElementById("showcase"),counter=0;
  for (var key in solitaires){
    var sci=document.createElement("div");
    sci.className="showcaseitem";
    var st=document.createElement("div");
    st.className="solitairethumb";
    st.style.backgroundPosition=-100*(counter%2)+"% "+20*Math.floor(counter/2)+"%";
    var p=document.createElement("p");
    p.innerHTML=solitaires[key].name || "Untitled Solitaire";
    sci.appendChild(st);
    sci.appendChild(p);
    sc.appendChild(sci);
    (function(k){
      sci.addEventListener("click",function(){
        relaySetupGame(k);
      });
    })(key);
    counter++;
  }
}

function relaySetupGame(type){
  toggleAction();
  setupGame(type);
}

fillShowcase();
setupGame("klondike");
