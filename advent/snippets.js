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
