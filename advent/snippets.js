/*Day 3 - task 2*/
var lgArr=[],
	x=11,
	y=11,
	dir=0,
	step=1
	dirs=[[1,0],[0,-1],[-1,0],[0,1]];

for (var i=0;i<23;i++){
	var arr=[];
	for (var j=0;j<23;j++){
		arr.push(0);
    }
	lgArr.push(arr);
}
lgArr[y][x]=1;

var count=0;
while (count<20*20){
	var tmpDir=dirs[dir];
	for (var j=0;j<step;j++){
		x+=tmpDir[0];
		y+=tmpDir[1]
		getSurroundingVal(x,y);
		count++;
    }
	dir=(dir+1)%4
	if (dir%2==0)
		step++;
}

function getSurroundingVal(x,y){
	var count=0;
	for (var i=-1;i<2;i++){
		for (var j=-1;j<2;j++){
            count+=lgArr[y+i][x+j];
        }
    }
	if (count>265149)
		console.log(count);
	lgArr[y][x]=count;
}
lgArr

//----------

var ord=1024,
	side=Math.ceil(Math.sqrt(ord));

side=side%2==1?side:side+1;
var depth=Math.floor(side/2),
	diff=side**2-ord,
	side2=Math.abs((ord%side+side-1)%side-Math.floor(side/2));
depth+side2

//----------
//Day 8
var registers={},
	exprs=document.body.innerText.trim().split("\n").map(e => e.split(" ")),
	compMax=0,
	totMax=0;

for (var i=0;i<exprs.length;i++){
	var exp=exprs[i];
	if (parseBool(exp)){
		var val=getOptiVal(registers[exp[0]])+(getOptiVal(exp[2])*(exp[1]=="inc"?1:-1));
		registers[exp[0]]=val;
		if (val>compMax)
			compMax=val;
	}
}

for (var key in registers){
	if (registers[key]>totMax)
		totMax=registers[key];
}

console.log(totMax,compMax);

//Could probably 
function parseBool(expr){
	var a=getOptiVal(expr[4]),
		b=getOptiVal(expr[6]);
	
	switch (expr[5]){
		case "==":
			return a==b;
		case ">=":
			return a>=b;
		case "<=":
			return a<=b;
		case "!=":
			return a!=b;
		case ">":
			return a>b;
		case "<":
			return a<b;
	}
}

function getOptiVal(val){
	if (isNaN(val))
		return registers[val] || 0;
	return Number(val);
}

