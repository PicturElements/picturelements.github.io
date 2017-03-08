//Load cowsay creatures, figlet font, and fortunes.

var chars=[{
  character: " ",
  ascii: ["    ","    ","    ","    ","    ","    "]
}];
var precedence=[" ","_","|","/","\\","(",")"];
var cows={},fortunes=[],limericks=[];

function loadFont(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var charRaw=this.responseText.split("@@");
      for (var i in charRaw){
        charRaw[i]=charRaw[i].split(/@\n /);
      }
      for (var i=0;i<charRaw.length-1;i++){
        charRaw[i][0]=charRaw[i][0].replace("\n","");
        if (i<94){  //The first 62 are ASCII characters without identifiers.
          charRaw[i][0]=charRaw[i][0].replace(" ","");
          chars.push({
            character: String.fromCharCode(33+i),
            ascii: charRaw[i]
          });
        }else{
          var tmpSplit=charRaw[i][0].split("\n");
          charRaw[i][0]=tmpSplit[1].replace(" ","");
          chars.push({
            character: String.fromCharCode(parseInt(tmpSplit[0])),
            ascii: charRaw[i]
          });
        }
      }
    }
  };
  
  xhttp.open("GET","https://raw.githubusercontent.com/PicturElements/picturelements.github.io/master/textfiles/figlet.txt",true);
  xhttp.send();
}

function loadCows(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var cowRaw=this.responseText.split("$BREAK");
      for (var i=0;i<cowRaw.length;i++){
        var lines=cowRaw[i].split("\n");
        var offset=lines[0]==""?1:0;
        var name=lines[offset];
        lines.splice(0,1+offset);
        cows[name]={ascii:lines};
      }
      console.log(cows);
    }
  };
  
  xhttp.open("GET","https://raw.githubusercontent.com/PicturElements/picturelements.github.io/master/textfiles/cows.txt",true);
  xhttp.send();
}

function loadFortunes(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      fortunes=this.responseText.split("\n%\n");
    }
  };
  
  xhttp.open("GET","https://raw.githubusercontent.com/PicturElements/picturelements.github.io/master/textfiles/fortunes.txt",true);
  xhttp.send();
}

function loadLimericks(){
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      limericks=this.responseText.split("\n%\n");
    }
  };
  
  xhttp.open("GET","https://raw.githubusercontent.com/PicturElements/picturelements.github.io/master/textfiles/limericks.txt",true);
  xhttp.send();
}

loadFont();
loadCows();
loadFortunes();
loadLimericks();
