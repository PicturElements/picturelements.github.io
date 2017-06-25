/**
 * JavaScript code to detect available availability of a
 * particular font in a browser using JavaScript and CSS.
 *
 * Author : Lalit Patel
 * Website: http://www.lalit.org/lab/javascript-css-font-detect/
 * License: Apache Software License 2.0
 *          http://www.apache.org/licenses/LICENSE-2.0
 * Version: 0.15 (21 Sep 2009)
 *          Changed comparision font to default from sans-default-default,
 *          as in FF3.0 font of child element didn't fallback
 *          to parent element if the font is missing.
 * Version: 0.2 (04 Mar 2012)
 *          Comparing font against all the 3 generic font families ie,
 *          'monospace', 'sans-serif' and 'sans'. If it doesn't match all 3
 *          then that font is 100% not available in the system
 * Version: 0.3 (24 Mar 2012)
 *          Replaced sans with serif in the list of baseFonts
 */

/**
 * Usage: d = new Detector();
 *        d.detect('font name');
 */
 
//Edit by PicturElements: simply provides a list of common fonts and checks them. Currently, there are 430 fonts in the list.

var fontsArr=["AC Filmstrip","Abadi MT Condensed Light","Adobe Arabic","Adobe Caslon Pro","Adobe Caslon Pro Bold","Adobe Fan Heiti Std B","Adobe Fangsong Std R","Adobe Garamond Pro","Adobe Garamond Pro Bold","Adobe Gothic Std B","Adobe Hebrew","Adobe Heiti Std R","Adobe Kaiti Std R","Adobe Ming Std L","Adobe Myungjo Std M","Adobe Song Std L","Aharoni","Albertus Extra Bold","Albertus Medium","Aldhabi","Amazone BT","AmerType Md BT","Andalus","Angsana New","AngsanaUPC","Antique Olive","Aparajita","AquaPlexus","Arabic Typesetting","Arial","Arial Black","Arial MT","Arial Narrow","Arrus BT","Aurora Cn BT","AvantGarde Bk BT","AvantGarde Md BT","BIRTH OF A HERO","BankGothic Md BT","Barbarian","Batang","BatangChe","Bazooka","Benguiat Bk BT","BernhardFashion BT","BernhardMod BT","BinnerD","Birch Std","Blackoak Std","Book Antiqua","Bookman Old Style","Bool","Bool Reduced","Boulder","Bremen Bd BT","Browallia New","BrowalliaUPC","Brush Script Std","CG Omega","CG Times","Calibri","Calibri Light","Calisto MT","Calligrapher","Cambria","Cambria Math","Candara","Canon","CaslonOpnface BT","Century Gothic","Century Schoolbook","Cezanne","Chaparral Pro","Charlemagne Std","Charlesworth","Charter BT","Charter Bd BT","Chaucer","ChelthmITC Bk BT","ChopinScript","Christmas Card","Clarendon Condensed","CloisterBlack BT","Comic Sans MS","Consolas","Constantia","Cool S","Cooper Std Black","CopperplGoth Bd BT","Copperplate Gothic Bold","Copperplate Gothic Light","Corbel","Cordia New","CordiaUPC","Cornerstone","Coronet","Courier","Courier New","Cuckoo","DFKai-SB","DaunPenh","Dauphin","David","DejaVu Sans","DejaVu Sans Condensed","DejaVu Sans Light","DejaVu Sans Mono","DejaVu Serif","DejaVu Serif Condensed","Denmark","DilleniaUPC","DokChampa","Dotum","DotumChe","Doulos SIL","Ebrima","Edo SZ","English 111 Vivace BT","EngraversGothic BT","Eraser","Estrangelo Edessa","EucrosiaUPC","Euphemia","Exotc350 Bd BT","FFF Tusj","FIRE 1","FangSong","FrankRuehl","Franklin Gothic Medium","Fransiscan","Freefrm721 Blk BT","FreesiaUPC","FrnkGothITC Bk BT","Futura Bk BT","Futura Lt BT","Futura Md BT","Futura ZBlk BT","FuturaBlack BT","Gabriola","Gadugi","Galliard BT","Garamond","Gautami","Geneva","Gentium Basic","Gentium Book Basic","GeoSlab 703 Lt BT","GeoSlab 703 XBd BT","Geomancy","Geometr231 BT","Geometr231 Hv BT","Geometr231 Lt BT","Georgia","Giddyup Std","Gisha","GoudyHandtooled BT","GoudyOLSt BT","Gulim","GulimChe","Gungsuh","GungsuhChe","Haettenschweiler","Harry P","Heather","Helvetica","Herald","Hobo Std","Humanst 521 Cn BT","Humanst521 BT","Humanst521 Lt BT","Illustrate IT","Impact","Incised901 BT","Incised901 Bd BT","Incised901 Lt BT","Informal011 BT","IrisUPC","Iskoola Pota","JasmineUPC","Javanese Text","Jester","Kabel Bk BT","Kabel Ult BT","KaiTi","Kalinga","Kartika","Kaufmann BT","Kaufmann Bd BT","Khmer UI","King","KodchiangUPC","Kokila","Korinna BT","Kozuka Gothic Pr6N B","Kozuka Gothic Pr6N EL","Kozuka Gothic Pr6N H","Kozuka Gothic Pr6N L","Kozuka Gothic Pr6N M","Kozuka Gothic Pr6N R","Kozuka Gothic Pro B","Kozuka Gothic Pro EL","Kozuka Gothic Pro H","Kozuka Gothic Pro L","Kozuka Gothic Pro M","Kozuka Gothic Pro R","Kozuka Mincho Pr6N B","Kozuka Mincho Pr6N EL","Kozuka Mincho Pr6N H","Kozuka Mincho Pr6N L","Kozuka Mincho Pr6N M","Kozuka Mincho Pr6N R","Kozuka Mincho Pro B","Kozuka Mincho Pro EL","Kozuka Mincho Pro H","Kozuka Mincho Pro L","Kozuka Mincho Pro M","Kozuka Mincho Pro R","Lao UI","Latha","Leelawadee","Leelawadee UI","Leelawadee UI Semilight","Letter Gothic","Letter Gothic Std","Levenim MT","Liberation Mono","Liberation Sans","Liberation Sans Narrow","Liberation Serif","LilyUPC","Linux Biolinum G","Linux Libertine G","Lithograph","Lithograph Light","Lithos Pro Regular","Lobster 1.4","Loki Cola","Long Island","Lucida Console","Lucida Handwriting","Lucida Sans","Lucida Sans Unicode","Lydian BT","MS Gothic","MS LineDraw","MS Mincho","MS PGothic","MS PMincho","MS UI Gothic","MV Boli","Malgun Gothic","Mangal","Marigold","Market","Marlett","Matisse ITC","Meiryo","Meiryo UI","Mesquite Std","Microsoft Himalaya","Microsoft JhengHei","Microsoft JhengHei Light","Microsoft JhengHei UI","Microsoft JhengHei UI Light","Microsoft New Tai Lue","Microsoft PhagsPa","Microsoft Sans Serif","Microsoft Tai Le","Microsoft Uighur","Microsoft YaHei","Microsoft YaHei Light","Microsoft YaHei UI","Microsoft YaHei UI Light","Microsoft Yi Baiti","MingLiU","MingLiU-ExtB","MingLiU_HKSCS","MingLiU_HKSCS-ExtB","Minion Pro","Minion Pro Cond","Minion Pro Med","Minion Pro SmBd","Miriam","Miriam Fixed","Mongolian Baiti","Monotype Corsiva","MoolBoran","Myanmar Text","Myriad Pro","Myriad Pro Cond","Myriad Pro Light","Myriad Web Pro","NSimSun","Narkisim","Neon Lights","News GothicMT","NewsGoth BT","Nirmala UI","Nirmala UI Semilight","Notera Personal Use Only","Nueva Std Cond","Nyala","OCR A Extended","OCR A Std","Old Century","Onyx BT","Open 24 Display St","Open Sans","OpenSymbol","Orator Std","OzHandicraft BT","PMingLiU","PMingLiU-ExtB","PT Serif","PTBarnum BT","Palatino Linotype","Papyrus","Pegasus","Pickwick","Pixel","Plantagenet Cherokee","Poplar Std","Poster","PosterBodoni BT","Prestige Elite Std","Pythagoras","Raavi","Raise Your Flag","Ribbon131 Bd BT","Rod","Roman New Times","Romantiques","Rosewood Std Regular","SF Movie Poster","Sakkal Majalla","Sceptre","Schwaben Alt","Segoe Print","Segoe Script","Segoe UI","Segoe UI Black","Segoe UI Emoji","Segoe UI Light","Segoe UI Semibold","Segoe UI Semilight","Segoe UI Symbol","Serifa BT","Serifa Th BT","Seven Arts","Shanghai","ShelleyVolante BT","Sherwood","Shonar Bangla","Shruti","Signatures","Signboard","SimHei","SimSun","SimSun-ExtB","Simplified Arabic","Simplified Arabic Fixed","Simpsonfont","Sitka Banner","Sitka Display","Sitka Heading","Sitka Small","Sitka Subheading","Sitka Text","Slice","Socket","Source Code Pro","Source Sans Pro","Souvenir Lt BT","Spiderfingers","Sports World","Staccato222 BT","Steamer","Stencil Std","Storybook","Subway","Swis721 BlkEx BT","Swiss911 XCm BT","Sylfaen","Symbol","THEmemefont","Tahoma","Technical","Tekton Pro","Tekton Pro Cond","Tekton Pro Ext","Teletype","Tempus Sans ITC","Times","Times New Roman","Times New Roman PS","Traditional Arabic","Trajan Pro","Trebuchet MS","Tristan","Tubular","Tunga","TypoUpright BT","Unicorn","Univers","Univers Condensed","Urdu Typesetting","Utsaah","VX Rocket","Vagabond","Vani","Verdana","Vijaya","Vrinda","Walter","Webdings","Westminster Allegro","Wingdings","Yu Gothic","Yu Gothic Light","Yu Mincho","Yu Mincho Demibold","Yu Mincho Light","ZapfEllipt BT","ZapfHumnst BT","ZapfHumnst Dm BT","Zurich BlkEx BT","Zurich Ex BT","nickelodeon","orange juice","spaceman"];

function genFontList(){
  var fontList=[];
  var detc=new Detector();
  for (var i=0;i<fontsArr.length;i++){
    if (detc.detect(fontsArr[i])){
      fontList.push(fontsArr[i]);
    }
  }
  return fontList;
}

var Detector = function() {
    // a font will be compared against all the three default fonts.
    // and if it doesn't match all 3 then that font is not available.
    var baseFonts = ['monospace', 'sans-serif', 'serif'];

    //we use m or w because these two characters take up the maximum width.
    // And we use a LLi so that the same matching fonts can get separated
    var testString = "mmmmmmmmmmlli";

    //we test using 72px font size, we may use any size. I guess larger the better.
    var testSize = '72px';

    var h = document.getElementsByTagName("body")[0];

    // create a SPAN in the document to get the width of the text we use to test
    var s = document.createElement("span");
    s.style.fontSize = testSize;
    s.innerHTML = testString;
    var defaultWidth = {};
    var defaultHeight = {};
    for (var index in baseFonts) {
        //get the default width for the three base fonts
        s.style.fontFamily = baseFonts[index];
        h.appendChild(s);
        defaultWidth[baseFonts[index]] = s.offsetWidth; //width for the default font
        defaultHeight[baseFonts[index]] = s.offsetHeight; //height for the defualt font
        h.removeChild(s);
    }

    function detect(font) {
        var detected = false;
        for (var index in baseFonts) {
            s.style.fontFamily = font + ',' + baseFonts[index]; // name of the font along with the base font for fallback.
            h.appendChild(s);
            var matched = (s.offsetWidth != defaultWidth[baseFonts[index]] || s.offsetHeight != defaultHeight[baseFonts[index]]);
            h.removeChild(s);
            detected = detected || matched;
        }
        return detected;
    }

    this.detect = detect;
};
