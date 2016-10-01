//A small but powerful library to solve sudokus

var SelectedIndex=0;
var board=[],alternatives=[],checkGrid=[0,1,2,9,10,11,18,19,20];
var changedStuff=true,time;

//Library-specific variables
var allSolved=[],validSolution=[];
var solveNo,solveCount;


//for backtrack solving
var savedBoards=[],insertAt=[],possibleValues=[],checked=[];
for (var i=0;i<80;i++){savedBoards.push(0); insertAt.push(0); possibleValues.push(0); checked.push(0);}
var level;

var sudoku={
	solve: function(array,no){
	 	solveNo=no;
		if (no<1||no==null||isNaN(no)){solveNo=1;}
		var success=coreSolve(array);
		return {
			solved: success,
			solution: board,
			allSolutions: allSolved,
			solutionNo: solveCount,
			time: (new Date().getTime()-time)
		}
	}
};

function setAndReset(){
  solveCount=0;
  allSolved=[];
	validSolution=[];
  
  savedBoards=[];
  insertAt=[];
  possibleValues=[];
  checked=[];
  for (var i=0;i<80;i++){savedBoards.push(0); insertAt.push(0); possibleValues.push(0); checked.push(0);}
}

//All solving algorithms
function coreSolve(input){
  setAndReset();
  board=[];
  for (var i=0;i<input.length;i++){
    board.push(input[i]);
  }
  
  //Check if input is valid
  if (!isValid(false)){
    return false;
  }

  time=new Date().getTime();
  if (logicSolve() && !isFull()){
    level=0;
    var tmpBoard=[];
    for (var i=0;i<81;i++){tmpBoard.push(board[i]);}
    savedBoards[0]=tmpBoard;
    var firstBox=getBox();
    insertAt[0]=firstBox;
    checked[0]=0;
    possibleValues[0]=alternatives[firstBox];
    backtrackSolve();
  }

  if (!isFull()||!isValid(true)){
    return false;
  }
  return true;
}

function getBox(){
  for (var i=2;i<10;i++){
    for (var n=0;n<81;n++){
      if (alternatives[n].length==i){
        return n;
      }
    }
  }
}

function isFull(){
  for (var i=0;i<81;i++){
    if (board[i]==0){return false;}
  }
  return true;
}

//Solve as far as possible using only logic
function logicSolve(){
  changedStuff=true;
  while (changedStuff){
    changedStuff=false;
    getAlternatives();
    exclusionSolve();
    alienationSolve();
  }
  for (var i=0;i<81;i++){
    if (alternatives[i].length<=1&&board[i]==0){return false;}
  }
  return true;
}

function exclusionSolve(){
  for (var i=0;i<81;i++){
    if (alternatives[i].length==1&&canPut(alternatives[i][0],i)){
      board[i]=alternatives[i][0];
      changedStuff=true;
    }
  }
}

function alienationSolve(){
  //check rows
  var outArr=[0,1,2,3,4,5,6,7,8];
  for (var i=0;i<81;i+=9){
    alienationHelper(i,outArr);
  }

  //check columns
  outArr=[0,9,18,27,36,45,54,63,72];
  for (var i=0;i<9;i++){
    alienationHelper(i,outArr);
  }

  //check boxes
  outArr=[0,1,2,9,10,11,18,19,20];
  for (var h=0;h<81;h+=27){
    for (var w=0;w<9;w+=3){
      alienationHelper(h+w,outArr);
    }
  }
}

function alienationHelper(startAt,inArr){
  var oneToNine=[0,0,0,0,0,0,0,0,0];
  var foundAt=[0,0,0,0,0,0,0,0,0];
  var active,actIndex;
  for (var m=0;m<9;m++){
    actIndex=startAt+inArr[m];
    active=alternatives[actIndex];
    for (var i=0;i<active.length;i++){
      if (board[actIndex]==0&&board[actIndex]!=active[i]){
        oneToNine[active[i]-1]++;
        foundAt[active[i]-1]=actIndex;
      }else{
        oneToNine[board[actIndex]-1]=2;
      }
    }
  }
  for (var c=0;c<9;c++){
    if (oneToNine[c]==1){
      board[foundAt[c]]=c+1;
      changedStuff=true;
    }
  }
}

function backtrackSolve(){
  while(true){
    var tmpArr=[];
    try{
      for (var i=0;i<81;i++){tmpArr.push(savedBoards[level][i]);}
    }catch(e){
      return false;
    }
    board=tmpArr;
    board[insertAt[level]]=possibleValues[level][checked[level]];
    level++;
    if (logicSolve()){
      var isF=isFull(),isV=isValid(true);
      if (isF && isV){
        solveCount++;
        allSolved.push(board);
				validSolution=new Array(board);
        if (solveCount==solveNo){break;}
      }
      else if (isF && !isV){
        goBack();
      }else{
        tmpArr=[];
        for (var i=0;i<81;i++){tmpArr.push(board[i]);}
        savedBoards[level]=tmpArr;
        var firstBox=getBox();
        insertAt[level]=firstBox;
        possibleValues[level]=alternatives[firstBox];
      }
    }else{
      goBack();
    }
  }
}

function goBack(){
  while(true){
    checked[level]=0;
    level--;
    checked[level]++;
    if (level<0){break;}
    if (checked[level]<possibleValues[level].length){break;}
  }
}

function getAlternatives(){
  alternatives=[];
  var alts=[];

  var counter=0;
  var match;
  for (var h=0;h<9;h++){
    for (var w=0;w<9;w++){
      alts=[];
      if (board[counter]==0){
        for (var val=1;val<10;val++){
          match=false;
          //check rows
          var startAt=h*9;
          for (var c=startAt;c<startAt+9;c++){
            if (board[c]==val){match=true; break;}
          }

          //check columns
          if (!match){
            startAt=w;
            for (var c=startAt;c<startAt+81;c+=9){
              if (board[c]==val){match=true; break;}
            }
          }

          //check boxes
          if (!match){
            startAt=27*Math.floor(counter/27)+3*Math.floor(w/3);
            //console.log(startAt);
            for (var c=0;c<9;c++){
              if (board[startAt+checkGrid[c]]==val){match=true; break;}
            }
          }

          if (!match){
            alts.push(val); 
          }
        }
      }
      alternatives.push(alts);
      counter++;
    }
  }
}

function isValid(aggr){
  for (var i=0;i<81;i++){
    if (aggr){
      if (!canPut(board[i],i)||board[i]==0){return false;}
    }else{
      if (!canPut(board[i],i)&&board[i]!=0){return false;}
    }
  }
  return true;
}

function canPut(input,location){
  var outArr=[0,1,2,3,4,5,6,7,8];
  var i=Math.floor(location/9)*9;
  for (var n=0;n<9;n++){
    if (board[i+outArr[n]]==input&&i+outArr[n]!=location){return false;}  //alert(location); 
  }

  //check columns
  outArr=[0,9,18,27,36,45,54,63,72];
  var i=location%9;
  for (var n=0;n<9;n++){
    if (board[i+outArr[n]]==input&&i+outArr[n]!=location){return false;}
  }

  //check boxes
  outArr=[0,1,2,9,10,11,18,19,20];
  var h=Math.floor(location/27)*27,w=Math.floor((location%9)/3)*3;
  for (var n=0;n<9;n++){
    if (board[h+w+outArr[n]]==input&&h+w+outArr[n]!=location){return false;}
  }
  return true;
}
