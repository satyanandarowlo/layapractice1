//@disablefeatures@

var layamap;

// Assign `currentlayamap` after `layamap` is loaded
async function loadLayamap() {
    try {
        const response = await fetch('./Data/layamap.json');
        if (!response.ok) {
            throw new Error('Failed to load layamap.json');
        }
        layamap = await response.json();
        currentlayamap = layamap; // Assign here after loading
    } catch (error) {
        console.error('Error loading layamap.json:', error);
    }
}

var customlayamap = [];
var currentlayamap;

var formulaprevioushtml=undefined;
var currentformulaobject={};
var copiedcomposition=undefined;

// var pageAudioContext = new AudioContext();
// var pageAudioContextclick = new AudioContext();
// var pagegainNode = pageAudioContext.createGain();
// var pagegainNodeclick = pageAudioContextclick.createGain();

var pageAudioContext = new AudioContext();
var pageAudioContextclick = pageAudioContext;
var pagegainNode = pageAudioContext.createGain();
var pagegainNodeclick = pageAudioContext.createGain();

var curplayingaudios =[];
function CreateNewContext(){
    pageAudioContext.close().then(function(){

        pageAudioContext = new AudioContext();
        pageAudioContextclick = pageAudioContext;
        pagegainNode = pageAudioContext.createGain();
        pagegainNodeclick = pageAudioContext.createGain();

    });
}

var audiohelperdata=[];
var allsounds =[];
var filesready=false;
var stop=0;

var layadirectory = "Data/Audio/Laya";
var defaultbpm=70;

//user options
var selectedthalam="adi";
var selectedgathi=4;
var selectedbpm=0;
var jathivolume=0.3;
var clickvolume=3;
//user options end

//recorded options
var recordedgathi=4;
var recordedbpm=60;
//recorded options end

var millisecondsperdivision=0;
var millisecondsperdivision__recorded=0;
var millisecondsperbpm=0;
var secondsperbpm=0;
var playspeed=0;

function computebpm_recorded(){
    secondsperbpm=1/(selectedbpm/recordedbpm);   
}

function computebpm(){
    millisecondsperbpm=1000/(selectedbpm/60);
    millisecondsperdivision=millisecondsperbpm/selectedgathi;

    
    //all recordings should be done in 60 bpm, then only it will match
    //there is the other way, you can record in any bpm, but each note should be considered irrespective of 
    var recordedplayspeed=selectedbpm/recordedbpm;
     playspeed=(recordedplayspeed/recordedgathi)*selectedgathi;
}



function getBestBPM(gathiinput,speedinput){
    var bestbpm = ((speedinput/gathiinput)*recordedgathi)*recordedbpm;
    return Number(bestbpm.toFixed(2));
}

var thalamap2 = [
    {Name:"Adi",Count:[1,0,0,0,1,0,1,0],DefaultGathi:4,Zeros:"fadeout"},
    {Name:"AdiChowkam",Count:[1,1,0,0,0,0,0,0,1,1,0,0,1,1,0,0],DefaultGathi:4,Zeros:"fadeout"},
    {Name:"Rupaka",Count:[1,1,0],DefaultGathi:4,Zeros:"fadeout"},
    {Name:"KhandaChapu",Count:[1,0,1,1,0],DefaultGathi:2,Zeros:"mute"},
    {Name:"MisraChapu",Count:[1,0,1,0,1,1,0],DefaultGathi:2,Zeros:"mute"},
]

var thalamsel;
var zerohandle;
var thalamcount;
var selectedspeed;

function selectDefaultOptions(){
    thalamsel = thalamap2[0].Name;
    $("#thalaminput").val(thalamsel);

    zerohandle =thalamap2[0].Zeros;
    thalamcount=thalamap2[0].Count;

    selectedspeed=1.2;
    $("#speedmedium").prop("checked",true)
}
    


function decideThalamCounts(){

    thalamsel = $("#thalaminput").val();
    var thalaminfo = thalamap2.filter((x)=>{return x.Name==thalamsel});

    thalamcount=thalaminfo[0].Count;
    zerohandle = thalaminfo[0].Zeros;
    selectedgathi = thalaminfo[0].DefaultGathi;
    selectedbpm = getBestBPM(selectedgathi,selectedspeed);
    
    $("#gathiinput").val(selectedgathi);
    $("#bpminput").val(selectedbpm);
}

function loaddiskjathis(){
    // Predefined list of audio files in the laya folder
    const audioFiles = [
        "1_,.mp3",
        "1_ta.mp3",
        "2_, ,.mp3",
        "2_dhi ,.mp3",
        "2_dhim ,.mp3",
        "2_ki ,.mp3",
        "2_nam ,.mp3",
        "2_ta ,.mp3",
        "2_ta ka.mp3",
        "2_thom ,.mp3",
        "3_, , ,.mp3",
        "3_dhi , ,.mp3",
        "3_dhim , ,.mp3",
        "3_ta , ,.mp3",
        "3_ta dhim ,.mp3",
        "3_ta ki ta.mp3",
        "3_thom , ,.mp3",
        "4_, , , ,.mp3",
        "4_dhim , , ,.mp3",
        "4_ta dhim , ,.mp3",
        "4_ta ka dhi mi.mp3",
        "4_ta ka dhi na.mp3",
        "4_ta ka ja nu.mp3",
        "5_, , , , ,.mp3",
        "5_dhim , , , ,.mp3",
        "5_ta dhi gi na ta.mp3",
        "5_ta dhim , , ,.mp3",
        "5_ta ka ta ki ta.mp3",
        "6_, , , , , ,.mp3",
        "6_dhim , , , , ,.mp3",
        "6_ta dhim , , , ,.mp3",
        "7_, , , , , , ,.mp3",
        "7_dhim , , , , , ,.mp3",
        "7_ta dhim , , , , ,.mp3",
        "8_, , , , , , , ,.mp3",
        "8_dhim , , , , , , ,.mp3",
        "8_ta dhim , , , , , ,.mp3",
        "9_, , , , , , , , ,.mp3",
        "9_dhim , , , , , , , ,.mp3",
        "9_ta dhim , , , , , , ,.mp3",
        "click2.mp3"
    ];

    var index = 0;
    for (var file of audioFiles) {
        if (file.indexOf("mp3") === -1 || file.indexOf("_start") !== -1) continue;

        if (file.indexOf("click") !== 0) {
            var content = file.replace(".mp3", "");
            var contentminushash = content.replace("0_", "");
            var size = contentminushash.substr(0, contentminushash.indexOf("_"));
            var onlytext = contentminushash.substr(contentminushash.indexOf("_") + 1);
            customlayamap.push({ sno: index, pattern: size, composition: undefined, text: onlytext, list: [content] });
        }
        index = index + 1;
    }
}

function loadallaudiotext() {
    // Predefined list of audio files in the laya folder
    const audioFiles = [
        "1_,.mp3",
        "1_ta.mp3",
        "2_, ,.mp3",
        "2_dhi ,.mp3",
        "2_dhim ,.mp3",
        "2_ki ,.mp3",
        "2_nam ,.mp3",
        "2_ta ,.mp3",
        "2_ta ka.mp3",
        "2_thom ,.mp3",
        "3_, , ,.mp3",
        "3_dhi , ,.mp3",
        "3_dhim , ,.mp3",
        "3_ta , ,.mp3",
        "3_ta dhim ,.mp3",
        "3_ta ki ta.mp3",
        "3_thom , ,.mp3",
        "4_, , , ,.mp3",
        "4_dhim , , ,.mp3",
        "4_ta dhim , ,.mp3",
        "4_ta ka dhi mi.mp3",
        "4_ta ka dhi na.mp3",
        "4_ta ka ja nu.mp3",
        "5_, , , , ,.mp3",
        "5_dhim , , , ,.mp3",
        "5_ta dhi gi na ta.mp3",
        "5_ta dhim , , ,.mp3",
        "5_ta ka ta ki ta.mp3",
        "6_, , , , , ,.mp3",
        "6_dhim , , , , ,.mp3",
        "6_ta dhim , , , ,.mp3",
        "7_, , , , , , ,.mp3",
        "7_dhim , , , , , ,.mp3",
        "7_ta dhim , , , , ,.mp3",
        "8_, , , , , , , ,.mp3",
        "8_dhim , , , , , , ,.mp3",
        "8_ta dhim , , , , , ,.mp3",
        "9_, , , , , , , , ,.mp3",
        "9_dhim , , , , , , , ,.mp3",
        "9_ta dhim , , , , , , ,.mp3",
        "click2.mp3"
    ];

    audiohelperdata.push({ name: "click", path: `${layadirectory}/click2.mp3` });

    for (var file of audioFiles) {
        if (file.indexOf("mp3") === -1) continue;

        if (file.indexOf("click") !== 0) {
            var content = file.replace(".mp3", "");
            var contentminushash = content.replace("0_", "");
            var size = contentminushash.substr(0, contentminushash.indexOf("_"));
            audiohelperdata.push({ name: content, path: `${layadirectory}/${content}.mp3`, size: Number(size) });
        }
    }
}


function loadallaudiobuffers()
{
    audiohelperdata.bufferlength=0;
    audiohelperdata.ready=false;
    audiohelperdata.forEach(function(item){
    var getSound1 = new XMLHttpRequest();
    getSound1.open("get",item.path, true);
    getSound1.responseType = "arraybuffer";

    getSound1.onload = function() {
        
        pageAudioContext.decodeAudioData(this.response, function(buffer) {
            item.savedbuffer=buffer;
            audiohelperdata.bufferlength++;
            if(audiohelperdata.bufferlength==audiohelperdata.length)
            audiohelperdata.ready=true;
        });
        };
    getSound1.send();
    });
}

function getABufferJathi(inputjathi){
    var text = inputjathi.text;

    //differnt string
    var starttext =text+"_start";
    
    var audiohelperinfos=[];
    if(inputjathi.index==0)
    {
        audiohelperinfos = audiohelperdata.filter( function(item){return (item.name==starttext);} );
    }

    //finds if any of special files not found
    if(audiohelperinfos.length==0){
        audiohelperinfos = audiohelperdata.filter( function(item){return (item.name==text);} );
    }

    audiohelperinfo = audiohelperinfos[0];
    var newbuffer = audiohelperinfo.savedbuffer;

    var newbuffersource = pageAudioContext.createBufferSource();
    newbuffersource.buffer = newbuffer; 
    newbuffersource.connect(pagegainNode);
    pagegainNode.connect(pageAudioContext.destination); 
    pagegainNode.gain.value=jathivolume;
    newbuffersource.playbackRate.value=playspeed;
    newbuffersource.size = audiohelperinfo.size;
    return newbuffersource;
}

function getABufferClick(){
    var audiohelperinfo = audiohelperdata.filter( function(item){return (item.name=="click");} )[0];
    var newbuffer = audiohelperinfo.savedbuffer;

    var newsrcbufferclick = pageAudioContextclick.createBufferSource();
    newsrcbufferclick.buffer = newbuffer; 
    newsrcbufferclick.connect(pagegainNodeclick);
    pagegainNodeclick.gain.value=clickvolume;
    pagegainNodeclick.connect(pageAudioContextclick.destination); 
    
    return newsrcbufferclick;
}

function stopaudios(){
    curplayingaudios.stopped=0;
    curplayingaudios.forEach(function(cachedaudio)
    { 
        cachedaudio.data.stop();
        curplayingaudios.stopped++;
    });   
}

function curaudiostopped(){
    if(curplayingaudios.length==curplayingaudios.stopped)
    return true;
}

var playstopped=1;
function playparallel(fileslist){

    // if(playstopped==0)
    //     return;
    // else
    //     playstopped=0;
    // //enable to play again
    // stop=0;

    var cachedaudios=[];

    //var thalaminfo = decideThalamCounts();
    

    var alljathiduration=0;
    var cnt=0;
    fileslist.forEach(function(currentjathi){
        
        var srcbufferjathi = getABufferJathi(currentjathi);
        
        // srcbufferjathi.gathi = 4;
        // cnt++;
        // //if(cnt%4!=1)
        // //srcbufferjathi.gathi = 3;

        if(currentjathi.gathi==undefined)
        srcbufferjathi.gathi=selectedgathi;
        else
        srcbufferjathi.gathi = currentjathi.gathi;

        var speed=currentjathi.speed;
        if(speed!=undefined){
            var mulby = Math.pow(2,speed-1);
            srcbufferjathi.gathi = Number(srcbufferjathi.gathi)*mulby;
        }
        
        
        var changedspeed=selectedbpm/recordedbpm;
        currentplayspeed=(changedspeed/recordedgathi)*srcbufferjathi.gathi;
        srcbufferjathi.playbackRate.value=currentplayspeed;

        
        var jathiduration = (secondsperbpm/srcbufferjathi.gathi)*srcbufferjathi.size;
        
        var playat=alljathiduration;
        
        cachedaudios.push({data:srcbufferjathi,type:"jathi",playat:playat});

        alljathiduration=alljathiduration+jathiduration;
    });

    var thalamduration=0;
    while(thalamduration<alljathiduration){
        thalamduration = thalamduration+thalamcount.length*secondsperbpm;
    }
    var durationdiff = thalamduration-alljathiduration;
    var settothala = $("#settothala").prop("checked");

    var totalclicks = thalamduration/secondsperbpm;

    for(var i=0;i<totalclicks;i++){
        var fingerindex = i%thalamcount.length;
        var fingervalue = thalamcount[fingerindex];

        if(fingervalue==0 && zerohandle=="mute")
        continue;

        var srcbufferclick = getABufferClick();
        cachedaudios.push({data:srcbufferclick,type:"click",playat:secondsperbpm*i});
    }

    cachedaudios.forEach(function(cachedaudio)
    { 
        if(cachedaudio.type=="jathi" && settothala==true){
            cachedaudio.playat=cachedaudio.playat+durationdiff;
        }
    });
    
    
    
    var starttime = pageAudioContext.currentTime;
    
    curplayingaudios=cachedaudios;

    cachedaudios.forEach(function(cachedaudio)
    { 
        cachedaudio.data.start(starttime+cachedaudio.playat);
    });    
    return;

    var count=0;
    var jathicharcount=0;
    var jathiplaying=0;
    var newjathiready=0;
    var currentjathisize=0;

    function playloop(){
        if(stop==1)
        {
            playstopped = 1;
            return;
        }
        

        if(fileslist.length==0 && jathiplaying ==0){
            playstopped = 1;
            nextcomposition();
            return;
        }
        

        var srcbufferclick = getABufferClick();
        
        

        //if the list has more than one, those are jathis
        if(fileslist.length>0 && jathiplaying==0){
            
            jathicharcount=0;
            
            newjathiready=1;
        }
        else{
            newjathiready=0;
        }
        
        if(newjathiready==1){

            jathiplaying=1;
           
            currentjathi=fileslist[0];
            fileslist.shift();
            var srcbufferjathi = getABufferJathi(currentjathi);
            
            currentjathisize = srcbufferjathi.size;
            

            
            setTimeout(function(){
                srcbufferjathi.start(0);
                //srcbufferjathi.loop=true;
                //srcbufferjathi.loopEnd=10;

                //srcbufferjathitwo.start(pageAudioContext.currentTime+5);
                //srcbufferjathithree.start(10000);
                
            },0)

            // setTimeout(function(){
            //     allowjathi=1;
            //     console.log("allowed jathi");
            // },currentjathi.size*millisecondsperdivision);
            
            
        }

        jathicharcount++;

        if(jathicharcount>=currentjathisize)
        jathiplaying=0;



            setTimeout(function(){
                if(count%selectedgathi==0)
                {
                    srcbufferclick.start(0);
                }   
            },0)
            
            setTimeout(function(){
                count++;
                playloop();
                
            },millisecondsperdivision)
        
        }

        playloop();
        
}

function playfinish()
{

            //nothing
       
}

function CompositionToArray(composition){

    var soundarray=[];
    var bracketelement=[];
    
    composition.forEach(function(item,index){
        if(item.type=="bracket"){

            if(item.val=="("){
                bracketelement.push(index+1);
            }
            else if(item.val==")"){
                bracketelement.push(index-1);
                var startindex = bracketelement[bracketelement.length-2];
                var endindex = bracketelement[bracketelement.length-1];
                
                for(var i=1;i<=item.repeatcount-1;i++){
                    var subcomposition = composition.slice(startindex,endindex+1);
                    var subarray = CompositionToArray(subcomposition);
                    // for(var j=startindex;j< endindex;j++){
                        
                    // }
                    soundarray = soundarray.concat(subarray);
                }

                bracketelement.pop();
                bracketelement.pop();
            }

        }
        else if(item.type=="addedjathi"){
            soundarray.push({val:item.val})
        }
        else if(item.type=="repeatcount"){
            for(var i=1;i<item.val;i++){
                var lastitem=soundarray[soundarray.length-1];
                soundarray.push(lastitem);
            }
        }
        else if(item.type=="gathinumber"){
            var lastitem=soundarray[soundarray.length-1];
            lastitem.gathi=item.val;
        }
        else if(item.type=="speed"){
            var lastitem=soundarray[soundarray.length-1];
            var speed=0;
            if(item.val==undefined){
                speed=undefined;
            }
            else if(item.val=="speed2"){
                speed=2;
            }
            else if(item.val=="speed3"){
                speed=3;
            }
            else if(item.val=="speed4"){
                speed=4;
            }
            lastitem.speed=speed;
        }


    });
    return soundarray;
    // allsounds.push({text:"click"});
    // //allsounds.push({text:"takita",size:3});
    // // allsounds.push({text:"takita",size:3});
    // // allsounds.push({text:"takita",size:3});
    // allsounds.push({text:"4_1"});
    // allsounds.push({text:"4_1"});
    // allsounds.push({text:"4_1"});
    // allsounds.push({text:"4_1"});
    // for(var i=0;i<10000;i++)
    // {
    //     allsounds.push({text:"5_7"});
    // }
    

    // for(var i=0;i<100;i++)
    // allsounds.push({text:"takadhina",size:5});
    
    
    //allsounds.push({text:"again"});
    //allsounds.push({text:"again"});
}



//playbuffer({text:"again"})

var inter1 = setInterval(function(){
    if(audiohelperdata.ready==true)
    
    {
        
        $("#startbutton").prop("disabled","");
        clearInterval(inter1);
        
    }

},1000)

var asc=1;
var incrementinterval;
var stopincrement=0;
function increasebpm(){
    selectedbpm=$("#bpminput").val();
    everysec = $("#incrementduration").val();
    setTimeout(function(){
        if(stopincrement==1)
        return;

        if(selectedbpm>140)
        asc=0;
        else if(selectedbpm<60)
        asc=1;

        if(asc==1)
        selectedbpm=Number(selectedbpm)+0.1;
        else
        selectedbpm=Number(selectedbpm)-0.1;
        

        computebpm();
        $("#bpminput").val(selectedbpm);

        increasebpm();
    },everysec);
    
}

function stopincremental(){
    stopincrement=1;
    selectedbpm = defaultbpm;
    computebpm();
    $("#bpminput").val(defaultbpm);
}

function setComposeWidthAfterAdding(){
    $(".addedjathidiv").each(function(index,jathipack){
        var jathiwidthpx = $(jathipack).find(".addedjathi").css("width");

        $(jathipack).find(".speed2").css("width",jathiwidthpx);
        $(jathipack).find(".speed3").css("width",jathiwidthpx);
        $(jathipack).find(".speed4").css("width",jathiwidthpx);

        var jathiwidth = Number(jathiwidthpx.replace("px",""));
        var gathiwidth = jathiwidth+((jathiwidth*20)/100);
        $(jathipack).find(".gathinumber").css("margin-left",gathiwidth);


        // var rightwidth = $(".right").css("width");
        // var givenjathi = $(jathipack).find(".addedjathi");
        // $(givenjathi).css('font-size',"inherit" );
        // // var totallines = $(givenjathi)[0].getClientRects().length;
        // // var fontpercentage = (100/totallines);
        // var fontpercentage=90;
        // if($(givenjathi)[0].getClientRects().length>1){
        //     $(jathipack).css('height','13%' );
        //     while($(givenjathi)[0].getClientRects().length>1){
        //         var currentfontsize = Number($(givenjathi).css('font-size').replace("px",""));
        //         var changedfontsize = (currentfontsize*fontpercentage)/100;
        //         $(givenjathi).css('font-size',changedfontsize );
        //         fontpercentage=fontpercentage-5;
        //     }


        // }


        
        var fontpercentage=90;
    
        var givenjathi = $(jathipack).find(".addedjathi");
        do{
            var rightwidth = Number($(".right").css("width").replace("px",""));
            var jathidivwidth = Number($(givenjathi).css("width").replace("px",""));
            var gaptoput = rightwidth*0.15;

            if(jathidivwidth<(rightwidth-gaptoput))
            break;

            var currentfontsize = Number($(givenjathi).css('font-size').replace("px",""));
            var changedfontsize = (currentfontsize*fontpercentage)/100;
            $(givenjathi).css('font-size',changedfontsize );
            fontpercentage=fontpercentage-5;
        }while(true)


        
        

    });
    
}

function setWidthAfterAdding(){
    $(".addedjathipack").each(function(index,jathipack){
        var jathiwidthpx = $(jathipack).find(".addedjathisaved").css("width");
        var margin = "-"+jathiwidthpx;
        $(jathipack).find(".speed2saved").css("width",jathiwidthpx);
        $(jathipack).find(".speed2saved").css("margin-left",margin);
        $(jathipack).find(".speed3saved").css("width",jathiwidthpx);
        $(jathipack).find(".speed3saved").css("margin-left",margin);
        $(jathipack).find(".speed4saved").css("width",jathiwidthpx);
        $(jathipack).find(".speed4saved").css("margin-left",margin);
        //$(jathipack).find(".gathinumbersaved").css("margin-left",jathiwidthpx);

        
        
    });
    
}

function ConvertCompositiontoHtml(composition){
    
    var allhtml="";
    allhtml=allhtml+"<div class='addedjathidivsaved' >";
    var gaphtml = "&nbsp; / &nbsp;"
    composition.forEach(function(item,index){
        
        if(item.type=="newjathi"){

            if(index!=0){
                allhtml = allhtml+"<div class='gaphtml'>&nbsp; / &nbsp;</div>";
            }

            allhtml=allhtml+"<div class='addedjathipack'>";
            
        }
        
        
        
        if(item.type=="bracket"){
            var repeattext="";
            if(item.val==")" && Number(item.repeatcount)>1 )
            repeattext = "["+ item.repeatcount+"]";

            allhtml=allhtml+"<div class='bracketsaved'>"+item.val+repeattext+"</div>"
        }
        
        if(item.type=="addedjathi"){
            var files=item.val;
            displaytext = getTextFromFiles(files);
            
            allhtml=allhtml+"<div class='addedjathisaved' files='"+files+"' >"+displaytext+"</div>"
        }

        if(item.type=="repeatcount" && Number(item.val)>1 ){
            allhtml=allhtml+"<span class='repeatcountsaved'>["+item.val+"]</span>";
        }

        if(item.type=="speed"){
            if(item.val=="speed2")
            {
                allhtml=allhtml+"<span class='speed2saved'  >________________________________________</span>";
            }
            else if(item.val=="speed3"){
                allhtml=allhtml+"<span class='speed2saved'  >________________________________________</span>";
                allhtml=allhtml+"<span class='speed3saved' >________________________________________</span>";
            }
            else if(item.val=="speed4"){
                allhtml=allhtml+"<span class='speed2saved'  >________________________________________</span>";
                allhtml=allhtml+"<span class='speed3saved' >________________________________________</span>";
                allhtml=allhtml+"<span class='speed4saved' >________________________________________</span>";
            }
            
        }
        if(item.type=="gathinumber" && Number(item.val)>1 ){
            allhtml=allhtml+"<span class='gathinumbersaved' >"+item.val+"</span>";
        }

        var nextitem = composition[index+1];
        
        if(index==composition.length-1){
            allhtml=allhtml+"</div>";
        }
        else if(nextitem!=undefined && nextitem.type=="newjathi")
        {
            allhtml=allhtml+"</div>";
        }
        

    });

    

    allhtml=allhtml+"</div>";
    
    return allhtml;
}

function InterpretFormula(){

    var formula=[];
    $(".right").find(".addedformulaline").each(function(index,spanitem){
    
        formula.push({name: $(spanitem).text().trim()});

    }); 
    
    return formula;
 }

 function putComposeFormulHtml(){
    var formulahtml = FormulaToHtml(currentformulaobject.formula);
    
    $(".right").html(formulahtml);
    $(".editingnow").text("Formula");
    $(".composeitems").hide();
    addcompositionforsections();
    setWidthAfterAdding();
    $("#selectallcomposeitems").prop("checked",false);
 }

 function FormulaToHtml(formula){
    var allhtml="";
    formula.forEach(function(section){
        if(section.name.trim().length>0)
        {
            var sectionline = getAFormulaLine(section.name);
            allhtml=allhtml+sectionline;
        }
        
    });
    return allhtml;
 }

 function addcompositionforsections(){
    $(".right").find(".addedformulaline").each(function(index,spanitem){
    
        var sectionname = $(spanitem).text().trim();
        var composition = currentformulaobject[sectionname];
        if(composition!=undefined){
            var displayhtml = ConvertCompositiontoHtml(composition);
            $(this).parent().find(".sectionjathi").html(displayhtml);
        }
        
        
    }); 
}

function EditHtml(playlistitem){
    var html="";
    if(playlistitem.type=="formula"){
        currentformulaobject = JSON.parse(JSON.stringify(playlistitem.val));
        putComposeFormulHtml();
    }
    else
    {
        html = ConvertCompositiontoComposeHtml(playlistitem.val);
        $(".right").html("");
        $(".right").append(html);
        setComposeWidthAfterAdding();
    }
    
}

function searchLayaMap(giventext){
    var matched = customlayamap.filter(function(x){ if(x.text==giventext) return true })
    if(matched.length==0)
    matched = layamap.filter(function(x){ if(x.text==giventext) return true });

    return matched;
}

function getSizeFromFiles(filetext){
    files = filetext.split("|");
    var sizetoreturn = 0;
    files.forEach(function(file){
        sizetoreturn=sizetoreturn+getSizeFromFile(file);
    })

    return sizetoreturn;
}

function getSizeFromFile(file){
    var size = file.substr(0,file.indexOf("_"));
    return Number(size);
}

function getTextFromFiles(filetext){
    var files = filetext.split("|");
    var texttoreturn = "";
    files.forEach(function(file){
        texttoreturn=texttoreturn+" "+getTextFromFile(file);
    })

    return texttoreturn.trim();
}

function getTextFromFile(file){
    var text = file.substr(file.indexOf("_")+1);
    return text;
}

function getAFormulaLine(sectionname){
    if(sectionname==undefined)
    sectionname="&nbsp;&nbsp;&nbsp;"
    var fullelement = "<div class='addedformulalinediv' > "
        +"<span class='removeformulaline'>-</span> "
        +"<span class='addedformulaline composeactions' contenteditable='true'>"+sectionname+"</span>"
        +"<input type='button' value='NewLine' class='newline composeactions' id='newline' />"
        +"<input type='button' value='Edit' class='edititem composeactions' id='edititem' />"
        +"<div class='sectionjathi'></div>"
        +"</div>";
    return fullelement;
}



function movebuttonforformulaclicked(element){
    if($(element).prev().text().toLowerCase()=="new"){
        $(".right").html("");
        currentformulaobject={};
        
    }
    
    var fullelement = getAFormulaLine();
    $(".right").append(fullelement);
    $(".editingnow").text("Formula");
}

function movebuttonclicked(element){
        var files=$(element).prev().attr("files");
        displaytext = getTextFromFiles(files);


        if(selectedjathiforappend!=undefined){
            
            var existingfiles = $(selectedjathiforappend).attr("files");
            var currentfiles = files;
            var newfiles = existingfiles+"|"+currentfiles;
            var newsize = getSizeFromFiles(newfiles);
            var newtext = getTextFromFiles(newfiles);

            var checkexisting  = customlayamap.filter(function(x){return x.text==newtext});
            if(checkexisting.length==0)
            {
                customlayamap.push({
                    sno:customlayamap.length+1,
                    pattern:newsize,
                    composition:undefined,
                    text:newtext,
                    list:newfiles.split("|")
                })
            }
            

            displaytext = newtext;
            files =newfiles;
        }

        var fullelement = "<div class='addedjathidiv' > "
        +"<span class='removejathi'>-</span> "
        +"<span class='bracket firstbracket' contenteditable='true'>&nbsp;</span> "
        +"<span class='addedjathi' files='"+files+"'>"+displaytext+"</span>"
        
        +"<div class='speed2 hiddensymbol'  >________________________________________</div>"
        +"<div class='speed3 hiddensymbol' >________________________________________</div>"
        +"<div class='speed4 hiddensymbol' >________________________________________</div>"
        +"<div class='gathinumber hiddensymbol' ></div>"
        +"[<span class='repeatcount' contenteditable='true'>1</span>]"
        +"<span class='bracket' contenteditable='true'>&nbsp;</span>"
        +"</div>";

        if(selectedjathiforappend!=undefined){
            $(selectedjathiforappend).attr("files",files);
            $(selectedjathiforappend).text(displaytext);

            
            
            //$(selectedjathiforappend).css('font-size', $(selectedjathiforappend).width() / $(selectedjathiforappend).text().length * (2.2) + 'px');

        }
        else if(selectedjathi!=undefined){
            $(selectedjathi).attr("files",files);
            $(selectedjathi).text(displaytext);
        }
        else if(jathipositionforinsert!=undefined){
            $(fullelement).insertBefore($(jathipositionforinsert).parent());
        }
        else{
            $(".right").append(fullelement);
        }

        
        setComposeWidthAfterAdding();
        resetUnderlineWidths();
        $(".rightparent").scrollTop($(".rightparent").prop("scrollHeight") );
}

function ConvertCompositiontoComposeHtml(composition){
    
    var fullelement = [];
    var repeatcontent = "";
    composition.forEach(function(item,index){
        var previousitem = composition[index-1];
        if(item.type=="newjathi"){
            if(previousitem!=undefined){
                fullelement.push("</div> ");
            }
            repeatcontent="";
            fullelement.push("<div class='addedjathidiv' > ");
            fullelement.push("<span class='removejathi'>-</span> ");
        }
        else if(item.type=="emptyspace"){
            if(previousitem!=undefined && previousitem.type=="newjathi")
            fullelement.push("<span class='bracket firstbracket' contenteditable='true'>&nbsp;</span>");
            else
            fullelement.push("<span class='bracket' contenteditable='true'>&nbsp;</span>");
        }
        else if(item.type=="addedjathi"){
            var files = item.val;
            displaytext = getTextFromFiles(files);
            fullelement.push("<span class='addedjathi' files='"+files+"' >"+displaytext+"</span>");
        }
        else if(item.type=="repeatcount"){
            var val=item.val;
            fullelement.push("[<span class='repeatcount' contenteditable='true'>"+val+"</span>]");
        }
        else if(item.type=="bracket" && item.repeatcount==undefined){
            //first bracket
            fullelement.push("<span class='bracket firstbracket' contenteditable='true'>"+item.val+"</span>");
        }
        else if(item.type=="bracket" && item.repeatcount!=undefined){
            //second bracket
            var content = item.val+"["+item.repeatcount+"]";
            if(repeatcontent!="")
            {
                content = repeatcontent+content;
                fullelement.pop();
            }
            
            fullelement.push("<span class='bracket' contenteditable='true'>"+content+"</span>");
            repeatcontent=content;
        }
        else if(item.type=="speed"){
            if(item.val=="speed2" || item.val=="speed3" || item.val=="speed4" ){
                fullelement.push("<div class='speed2'  >________________________________________</div>");
            }
            else{
                fullelement.push("<div class='speed2 hiddensymbol'  >________________________________________</div>");
            }
            if(item.val=="speed3" || item.val=="speed4" ){
                fullelement.push("<div class='speed3'  >________________________________________</div>");
            }
            else{
                fullelement.push("<div class='speed3 hiddensymbol'  >________________________________________</div>");
            }
            if(item.val=="speed4" ){
                fullelement.push("<div class='speed4  >________________________________________</div>");
            }
            else{
                fullelement.push("<div class='speed4 hiddensymbol'  >________________________________________</div>");
            }
        }
        else if(item.type=="gathinumber"){
            if(item.val!=undefined)
            fullelement.push("<div class='gathinumber' >"+item.val+"</div>");
            else{
                fullelement.push("<div class='gathinumber hiddensymbol' ></div>");
            }
        }

    });

    if(composition.length>0)
    fullelement.push("</div> ");

    return fullelement.join("");
    

}

function clearPractice(){
    currentplaylist=[];
    $(".playlist").html("");
}

var currentplaylist=[];
function Savecomposition(){
    var composition = Interpretjathis();
    
    if($(".editingnow").text().toLowerCase()=="formula"){
        var formulaobj = JSON.parse(JSON.stringify(currentformulaobject));
        currentplaylist.push({val:formulaobj,type:"formula"});
    }
    else{
        currentplaylist.push({val:composition,type:"composition"});
    }
    
    
    savedjathisdisplay();
}

function savedjathisdisplay(){
    $(".playlist").html("");
    currentplaylist.forEach(function(playlistitem,index){
        if(playlistitem.type=="formula"){
            var html="";
            var formulaobj = playlistitem.val;
            html=html+"<div class='addedcompositiondiv' index='"+index+"' > <span class='removecomposition'>-</span>&nbsp;&nbsp;<span class='editcomposition'><<</span>" ;
            formulaobj.formula.forEach(function(section){
                var composition = formulaobj[section.name];
                if(composition!=undefined){
                    var compositiontojathi = ConvertCompositiontoHtml(composition);
                    
                    html=html+"<br><span class='sectionname'><b>"+section.name+"</b></span><br> "
                    +"<span class='jathitext'>"+compositiontojathi+"</span> "
                    
                }
            });

            html=html+"</div>";

            $(".playlist").append(html);
            
        }
        else{
            var composition = playlistitem.val;
            var compositiontojathi = ConvertCompositiontoHtml(composition);
            $(".playlist").append("<div class='addedcompositiondiv' index='"+index+"' > <span class='removecomposition'>-</span>&nbsp;&nbsp;<span class='editcomposition'><<</span> <span class='jathitext'>"+compositiontojathi+"</span> </div>");
        }

        
    })

    setWidthAfterAdding();

    $(".compositionlisttextarea").val(JSON.stringify(currentplaylist));

    
    $(".playlist").scrollTop($(".playlist").prop("scrollHeight") );
}

function resetjathisdisplay(){
    currentplaylist=[];
    $(".playlist>.addedcompositiondiv>.addedcomposition").each(function(item){
        var actualitem = $(".playlist>.addedcompositiondiv>.addedcomposition")[item];
        var text = $(actualitem).text();
        currentplaylist.push(JSON.parse(text));
        
    });

    $(".compositionlisttextarea").val(JSON.stringify(currentplaylist));
}

function loadcompositions(){
    var playlist = $(".compositionlisttextarea").val();
    currentplaylist = JSON.parse(playlist);
    savedjathisdisplay();
}

function downloadpreset() {
    var playlist = $(".compositionlisttextarea").val();
    var filename = "mypreset.json";
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(playlist));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }

function uploadpreset(){
    var file = document.getElementById("fileForUpload").files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            $(".compositionlisttextarea").val(evt.target.result)
            //uploadpreset();
            //document.getElementById("fileContents").innerHTML = evt.target.result;
        }
        reader.onerror = function (evt) {
            $(".compositionlisttextarea").val("error reading file, but no worries, you can manually copy paste and then practice")
            //document.getElementById("fileContents").innerHTML = "error reading file";
        }
    }
}

function displaycomposition(){
    var composition = Interpretjathis();
    $(".resultedcomposition").val(JSON.stringify(composition));
}

function clearCompose(){
    $(".right").children().remove();
    if($(".editingnow").text()=="Formula")
    {
        $(".composemode").hide();
        currentformulaobject={};
        $(".editingnow").text("");
    }
}

function getMappedItems(item){
    var list=[];
    var text = item.text.substr(item.text.lastIndexOf("_")+1,item.text.length);
    var matched = searchLayaMap(text);
    if(matched.length>0){
        matched[0].list.forEach(function(item,index){
            list.push(item);
        })
        
    }
    return list;
}

function ToActualArray(soundarray){
    var ActualArray=[];
    soundarray.forEach(function(item,i){
        var list = item.val.split("|");
        list.forEach(function(text,index){
            ActualArray.push({index:index,text:text,gathi:item.gathi,speed:item.speed});
        })
        
    });

    return ActualArray;
}

function playformula(formulaobject){


    preplayingops();
    var currentallcompositions = [];
    formulaobject.formula.forEach(function(section){
        var composition = formulaobject[section.name];
        if(composition!=undefined)
        {
            currentallcompositions=currentallcompositions.concat(composition);
        }
    });

    
    playcomposition(currentallcompositions);
}

function playcomposition(composition){
    if(initiationprogress==1)
    return;
    else
    initiationprogress=1;
    
    
    stopall();

    var checkifstoppedthentry = setInterval(function(){

        if(curaudiostopped()==true){
            setTimeout(function(){
                
                pushcomposition(composition);
                
                
                initiationprogress=0;
    
            },1000);
            clearInterval(checkifstoppedthentry);
        }
        

    },500);
}

function pushcomposition(composition){
        $(".resultedcomposition").val(JSON.stringify(composition));
        var soundarray = CompositionToArray(composition);
        var actualArray = ToActualArray(soundarray);
        playparallel(actualArray);
}

var currentcompositionindex=0;

function nextcomposition(){
    playfromplaylist(1);
}

function prevcomposition(){
    playfromplaylist(-1);
}

var initiationprogress = 0;
function playfromplaylist(next){
    
    currentcompositionindex=currentcompositionindex+next;

    if(currentplaylist.length<=currentcompositionindex || currentcompositionindex<0){
        return;
    }

    var playlistitem = currentplaylist[currentcompositionindex];

    $(".playlist>.addedcompositiondiv").css("background","");
    $(".playlist>.addedcompositiondiv")[currentcompositionindex].style.background="rgb(32, 178, 170)";


//    playcomposition(playlistitem);
    playformulaorcomposition(playlistitem);

    
}

function playformulaorcomposition(playlistitem){
    if(playlistitem.type=="formula")
    playformula(playlistitem.val)
    else
    playcomposition(playlistitem.val);
}

function playmetronnomeonly(){
    
}

function preplayingops(){
    selectedthalam = $("#thalaminput").val();
    selectedgathi = Number($("#gathiinput").val());
    selectedbpm = Number($("#bpminput").val());
    defaultbpm=selectedbpm;
    computebpm_recorded();
    computebpm();
}

var started=0;
function startall(){
    if(isNaN(currentcompositionindex)||currentplaylist.length<=currentcompositionindex){
        currentcompositionindex=0;
    }
    
    preplayingops();
    playfromplaylist(0);
    started=1;
};

function stopall(){
    stopaudios();
    stop=1;
    started=0;
}

function Interpretjathis(){

    var composition = [];

    $(".right>.addedjathidiv").each(function(index,rowitem){
        
        composition.push({type:"newjathi"});
        

        $(rowitem).children().each(function(i,actualitem){
        
        // var actualitem = $(".right>.addedjathidiv").children()[item];
        var type = $(actualitem).attr("class")

        if(type=="bracket" || type.indexOf("bracket")!=-1)
        {
            var content = $(actualitem).text().trim();
            var changedcontent = content;
            content.split("").forEach(function(item){
                if(item=="(" || item == "|")
                composition.push({type:"bracket" ,val: item});

                if(item==")")
                {
                    var firstbr = changedcontent.indexOf("[");
                    var lastbr = changedcontent.indexOf("]");
                    var number = changedcontent.substr(firstbr+1,lastbr-firstbr-1);
                    composition.push({type:"bracket" ,val: item, repeatcount: Number(number) });
                    changedcontent = changedcontent.substr(lastbr+1);
                }
            })

            if(content.trim().length==0){
                composition.push({type:"emptyspace"})
            }
            
        }
        else if(type=="addedjathi")
        {
            var jathifiles = $(actualitem).attr("files").trim();
            composition.push({type:type ,val:jathifiles});
        }
        
        else if(type=="repeatcount")
        {
            var content = $(actualitem).text().trim();
            // var firstbr = content.indexOf("[");
            // var lastbr = content.indexOf("]");
            // var number = content.substr(firstbr+1,lastbr-1);
            composition.push({type:type ,val: content});
        }

        else if(type.indexOf("speed2")!=-1 && type.indexOf("hiddensymbol")!=-1 ){
            composition.push({type:"speed" ,val: undefined});
        }
        else if(type.indexOf("speed2")!=-1 && type.indexOf("hiddensymbol")==-1 ){
            composition.push({type:"speed" ,val: "speed2"});
        }
        else if(type.indexOf("speed3")!=-1 && type.indexOf("hiddensymbol")==-1 ){
            composition.pop();
            composition.push({type:"speed" ,val: "speed3"});
        }
        else if(type.indexOf("speed4")!=-1 && type.indexOf("hiddensymbol")==-1 ){
            composition.pop();
            composition.push({type:"speed" ,val: "speed4"});
        }
        else if(type.indexOf("gathinumber")!=-1 && type.indexOf("hiddensymbol")==-1 ){
            composition.push({type:"gathinumber" ,val: $(actualitem).text()});
        }
        else if(type.indexOf("gathinumber")!=-1 && type.indexOf("hiddensymbol")!=-1 ){
            composition.push({type:"gathinumber" ,val: undefined});
        }

    });
});

    return composition;

}

var blinkelements=[];



function blinkthiselement(){
    var repeatcount=0;
    var parentelem = this;
    function repeat(){
        if(parentelem.blinkstopped==1)
        return;
        
        $(parentelem.element).css("background-color","blue");
        repeatcount=repeatcount+1;
        
        setTimeout(function(){

            $(parentelem.element).css("background-color","");
            
            setTimeout(function(){
                repeat();
            },200);

        },200);
        
    }

    repeat();
}

function blinkelement(element){
    stopAllblinking();
    var elepack = {};
    elepack.element = element;
    elepack.blink=blinkthiselement;
    elepack.blink();
    blinkelements.push(elepack);
    
}

function stopAllblinking(){
    blinkelements.forEach(function(item){
        item.blinkstopped=1;
    })
    
}

function stopblinking(element){
    blinkelements[blinkelements.indexOf(element)].blinkstopped=1;
}


function setEvents(){

    $("#savecomposition").click(Savecomposition);
    $("#showcomposition").click(displaycomposition);
    $("#clearComposeButton").click(clearCompose);
    $("#startbutton").click(startall);
    $("#stopbutton").click(stopall);
    $("#nextbutton").click(nextcomposition);
    $("#prevbutton").click(prevcomposition);
    $("#loadbutton").click(loadcompositions);
    $("#clearPracticeButton").click(clearPractice);
    
    $("#uploadbutton").click(function(){
        uploadpreset();
        blinkelement("#loadbutton");
    });
    $("#downloadbutton").click(downloadpreset);

    $("#fileForUpload").change(function(){
        blinkelement("#uploadbutton");
    });

    $("#refreshbutton").click(function(){
        location.reload();
    });
    $('#filtervalues').on('input', function() {
        // do something
        loadjathis($('#filtervalues').val())
    });
    $("#filtertype").change(function(){
        if($("#filtertype").val().toLowerCase()=="all"){
            currentlayamap = customlayamap;
            loadjathis();
        }
        
        else if($("#filtertype").val().toLowerCase()=="custom"){
            currentlayamap = layamap;
            loadjathis();
        }
        
        else if($("#filtertype").val().toLowerCase()=="formulas"){
            currentlayamap = formulas;
            loadformulas();
        }
        
        
    });

    
    

}

var shownotice=function(message){
    $(".anymessages").text(message);
    $(".anymessages").css("color","yellow");
    $(".anymessages").prop("type","general");
}

var stickmessage=function(message){
    $(".anymessages").text(message);
    $(".anymessages").css("color","yellow");
    $(".anymessages").prop("type","general");
    
}

var generalmessage=function(message){
    $(".anymessages").text(message);
    $(".anymessages").css("color","yellow");
    $(".anymessages").prop("type","general");
    setTimeout(()=>{
        if($(".anymessages").prop("type")=="general")
        $(".anymessages").text("");
    },5000);
}

var warningmessage=function(message){
    $(".anymessages").text(message);
    $(".anymessages").css("color","orange");
    $(".anymessages").prop("type","warning");
    setTimeout(()=>{
        if($(".anymessages").prop("type")=="warning")
        $(".anymessages").text("");
    },5000);
}

var errormessage=function(message){
    $(".anymessages").text(message);
    $(".anymessages").css("color","red");
    $(".anymessages").prop("type","error");
    setTimeout(()=>{
        if($(".anymessages").prop("type")=="error")
        $(".anymessages").text("");
    },5000);
}

var selectedjathi;
var selectedjathiforappend;
var jathipositionforinsert;
var blink=0;

async function initializeobjects(){
    await loadLayamap();
    selectDefaultOptions();
    startConnection();
    setEvents();

    $("#bpminput").val(defaultbpm);
    loaddiskjathis();
    loadjathis();
    loadallaudiotext();
    loadallaudiobuffers();

    $(".leftparent").on("click",".movebutton",function(){
        //@polling@
        movebuttonclicked(this);
        
    });

    $(".leftparent").on("click",".movebuttonforformula",function(){
        //@polling@
        movebuttonforformulaclicked(this);
        
    });

    

    $(document).keypress(function (event) {
        if (event.keyCode === 10 || event.keyCode === 13) {
            event.preventDefault();
        }
    });

    function readGathiandSet(){
        var gathielem = $(selectedjathi).parent().find(".gathinumber");
        var jathisgathi = $(gathielem).text();
        if(jathisgathi!="")
        {
            $("#composegathi").val(jathisgathi.trim())
        }
    }

    $("#gathiinput").change(function(){
        selectedgathi = Number($("#gathiinput").val().trim());
        $("#composegathi").val(selectedgathi);

        selectedbpm = getBestBPM(selectedgathi,selectedspeed);
    
        $("#bpminput").val(selectedbpm);
    });

    $("#thalaminput").change(function(){
        selectedthalam = $("#thalaminput").val().trim();
        decideThalamCounts();
    });

    $(".speedinput").change(function(){
        selectedspeed = $("input[type='radio'][name='speedinput']:checked").val();

        selectedbpm = getBestBPM(selectedgathi,selectedspeed);
    
        $("#bpminput").val(selectedbpm);
    });

    function setGathiComposeForSelected(inputjathi){
        
        var selcomposegathi = $("#composegathi").val();
        var jathielem = $(inputjathi).parent().find(".addedjathi");
        var jathiwidthpx = $(jathielem).css("width");

        var gathielem = $(inputjathi).parent().find(".gathinumber");
        var jathiwidth = Number(jathiwidthpx.replace("px",""));
        var gathiwidth = jathiwidth+((jathiwidth*20)/100);
        $(gathielem).removeClass("hiddensymbol");
        $(gathielem).css("margin-left",gathiwidth);
        $(gathielem).text(selcomposegathi);
    }

    function setGathiCompose(){
        

        if($("#selectallcomposeitems").prop("checked")==true)
        {
            $(".right").find(".addedjathi").each(function(index,selectedjathinow){
                setGathiComposeForSelected(selectedjathinow);
            });
        }
        else if(selectedjathi!=undefined)
        setGathiComposeForSelected(selectedjathi);

        
    }

    $("#composegathi").change(function(){
        setGathiCompose();
        
    });

    $("#composegathi").click(function(){
        setGathiCompose();
        
    });

    function addUnderLineForSelected(inputjathi){
        var speed2 = $(inputjathi).parent().find(".speed2");
        var speed3 = $(inputjathi).parent().find(".speed3");
        var speed4 = $(inputjathi).parent().find(".speed4");

        var lineelem ;
        if($(speed2).css("display")=="none")
        lineelem=speed2;
        else if($(speed3).css("display")=="none")
        lineelem=speed3;
        else if($(speed4).css("display")=="none")
        lineelem=speed4;

        var jathielem = $(inputjathi).parent().find(".addedjathi");
        $(lineelem).removeClass("hiddensymbol");
        
        var jathiwidthpx = $(jathielem).css("width")
        $(lineelem).css("width",jathiwidthpx);
    }

    $("#addunderline").click(function(){

        // if(selectedjathi==undefined)
        // return;
        

        if($("#selectallcomposeitems").prop("checked")==true)
        {
            $(".right").find(".addedjathi").each(function(index,selectedjathinow){
                addUnderLineForSelected(selectedjathinow);
            });
        }
        else if(selectedjathi!=undefined)
        addUnderLineForSelected(selectedjathi);
        
    });


    function removeUnderLineForSelected(inputjathi){
        var speed2 = $(inputjathi).parent().find(".speed2");
        var speed3 = $(inputjathi).parent().find(".speed3");
        var speed4 = $(inputjathi).parent().find(".speed4");

        var lineelem ;
        if($(speed4).css("display")!="none")
        lineelem=speed4;
        else if($(speed3).css("display")!="none")
        lineelem=speed3;
        else if($(speed2).css("display")!="none")
        lineelem=speed2;

        $(lineelem).addClass("hiddensymbol");
    }

    $("#removeunderline").click(function(){

        if($("#selectallcomposeitems").prop("checked")==true)
        {
            $(".right").find(".addedjathi").each(function(index,selectedjathinow){
                removeUnderLineForSelected(selectedjathinow);
            });
        }
        else if(selectedjathi!=undefined)
        removeUnderLineForSelected(selectedjathi);

        
    });
    

    $('html').click(function(e) {    
        //@polling@
        blink=0;
        $(".addedjathi").css("background-color","");
        $(".firstbracket").css("background-color","");
        
        if($(e.target).hasClass('ignoreclick') ){
            return;
        }

        if($(e.target).hasClass('addedjathi') )
        {
            selectedjathi = e.target;
            jathipositionforinsert=undefined;
            selectedjathiforappend=undefined;
            //$(selectedjathi).css("background-color","yellow")  
            blinkelement(selectedjathi);    
            readGathiandSet();   
        }
        else if($(e.target).hasClass('bracket') && !$(e.target).hasClass('firstbracket'))
        {
            var selbracket = e.target;
            selectedjathiforappend = $(selbracket).parent().find(".addedjathi");
            selectedjathi=undefined;
            //$(selectedjathi).css("background-color","yellow")  
            blinkelement(selbracket);    
            
        }
        else if($(e.target).hasClass('firstbracket') )
        {
            jathipositionforinsert = e.target;
            selectedjathi=undefined;
            selectedjathiforappend=undefined;
            blinkelement(jathipositionforinsert);
            //$(jathipositionforinsert).css("background-color","yellow")         
        }
        else if(!$(e.target).hasClass('movebutton') ){
            selectedjathi=undefined;
            selectedjathiforappend=undefined;
            jathipositionforinsert=undefined;
            stopAllblinking();
        }
        
        
        
     }); 

     

    $("#playCompose").on("click",function(){
        playformula(currentformulaobject);
    })
    
    $(".right").on('click', '.newline', function(){
        var fullelement = getAFormulaLine();
        //$(this).parent().remove();
        $(fullelement).insertAfter($(this).parent());
    });

    $(".right").on('click', '.removeformulaline', function(){
        
        //$(this).parent().remove();
        $(this).parent().remove();
    });

    $(".right").on('click', '.edititem', function(){
        var edititemname = $(this).parent().find(".addedformulaline").text().trim();
        if(edititemname.trim().length==0)
        {
            alert('Invalid Name! please enter a name for this section!');
            return;
        }
        
        
        currentformulaobject.currentformulaname = edititemname;
        currentformulaobject.formula = InterpretFormula();
        $(".right").html("");
        var existingcomposition = currentformulaobject[currentformulaobject.currentformulaname];
        if(existingcomposition!=undefined && existingcomposition.length!=0)
        {
            var html = ConvertCompositiontoComposeHtml(existingcomposition);
            $(".right").append(html);
            setComposeWidthAfterAdding();
        }
        
        $(".editingnow").text(edititemname);
        $("#filtertype").val("Custom");
        $("#filtertype").trigger("change")
        $(".composeitems").show();
        $(".composemode").show();
    });

    

    $("#backtoformula").on('click', function(){
        if(currentformulaobject.formula==undefined)
        return;
        var composition = Interpretjathis();
        currentformulaobject[currentformulaobject.currentformulaname]=composition;
        putComposeFormulHtml();
    });

    $("#copycomposition").on('click', function(){
        copiedcomposition = Interpretjathis();
    });

    $("#pastecomposition").on('click', function(){
        var html = ConvertCompositiontoComposeHtml(copiedcomposition);
        $(".right").append(html);
        setComposeWidthAfterAdding();
    });
    
    

    
    
    

    $(".right").on('click', '.removejathi', function(){
        //@polling@
        $(this).parent().remove();
    });

    $(".playlist").on("click",".removecomposition",function(){
        //@polling@
        var index = Number($(this).parent().attr("index"));
        //alert(index);
        currentplaylist.splice(index,1);
        savedjathisdisplay();
        //$(this).parent().remove();
        //resetjathisdisplay();
    });

    $(".playlist").on("click",".editcomposition",function(){
        //@polling@
        $(".addedcompositiondiv").removeAttr("sel");
        $(this).parent().attr("sel","yes")
        //resetjathisdisplay();
        var selectedindex =  findhighlightedcompositionindex();
        EditHtml(currentplaylist[selectedindex]);

    });

    function findhighlightedcompositionindex(){
        var selectedindex = undefined;
        $(".playlist>.addedcompositiondiv").each(function(index,item){
            //var actualitem = $(".playlist>.addedcompositiondiv>.addedcomposition")[item];
            var selected = $(item).attr("sel");
            if(selected=="yes"){
                selectedindex=index;
                
            }
        });

        return selectedindex;

        
    }

    function findhighlightedcompositionindexbycolor(){
        var changed=false;
        $(".playlist>.addedcompositiondiv").each(function(index,item){
            //var actualitem = $(".playlist>.addedcompositiondiv>.addedcomposition")[item];
            var color = $(item).css("background-color");
            if(color=="rgb(32, 178, 170)"){
                currentcompositionindex=index;
                changed=true;
            }
        });

        if(changed){
            if(started==1)
            playfromplaylist(0);
        }
    }

    $(".playlist").on("click",".addedcompositiondiv",function(){
        //@polling@
        $(".playlist>.addedcompositiondiv").css("background-color","");
        $(this).css("background-color","rgb(32, 178, 170)");
        findhighlightedcompositionindexbycolor();
    });

    

    $("#incrementalbpm").change(function(item){
        var checkedornot = $(this).prop("checked");
        if(checkedornot==false)
        stopincremental();
        else
        stopincrement=0;
    });

    
}


function deinitializeobjects(){
    errormessage('Trial limit reached!')

    $("div").unbind();
    $("input").unbind();
    $("canvas").unbind();
    $(".mainboxes").fadeOut(2000);
    $(".bigmessage").fadeIn(1000);

    stopall();
}

function startConnection(){
    setInterval(()=>{
        //@polling@
    },5000);
}


function resetUnderlineWidths(){
    $(".speed2").each(function(index,lineelem){
        var jathielem = $(lineelem).parent().find(".addedjathi");
        var jathiwidthpx = $(jathielem).css("width")
        $(lineelem).css("width",jathiwidthpx);
     });

     $(".speed3").each(function(index,lineelem){
        var jathielem = $(lineelem).parent().find(".addedjathi");
        var jathiwidthpx = $(jathielem).css("width")
        $(lineelem).css("width",jathiwidthpx);
     });

     $(".speed4").each(function(index,lineelem){
        var jathielem = $(lineelem).parent().find(".addedjathi");
        var jathiwidthpx = $(jathielem).css("width")
        $(lineelem).css("width",jathiwidthpx);
     });
}

function loadformulas(){
    $(".jathilist").html("");
    var item= "<span class='jathi' files=''>New</span><span class='movebuttonforformula ignoreclick'>&nbsp;<b class='ignoreclick'>>></b></span><br>"
    $(".jathilist").append(item);
}

function loadjathis(searchval){
    
    var originalsearchval=searchval;
    $(".jathilist").html("");
    for (var jathi of currentlayamap) {
        if(jathi.text.indexOf("click")!=0)
        {
            searchval=originalsearchval;
            var qualified = false;
            if(searchval!=undefined && searchval.trim().length!=0)
            {
                searchval= searchval.split(" ").join("");
                var jathival = jathi.text.split(' ').join("");
                var searchpatt = searchval.split("*");
            
                if(isNaN(searchval.charAt(0))==false){
                    if(jathi.pattern==searchval[0])
                    qualified=true;
                    else 
                    qualified=false;
                    
                    if(searchval[1]=="_")
                    searchval=searchval.substr(2);
                    else
                    searchval=searchval.substr(1);
                }

                if(searchval.trim().length!=0 &&  searchpatt.length==1
                    && jathival.indexOf(searchval)==0
                    && jathival.indexOf(searchval)==0
                    ){
                        qualified=true;
                    }
                else if(searchval.trim().length!=0 &&  searchpatt.length>1 && searchpatt[0]==""
                    && jathival.indexOf(searchpatt[1])!=-1
                    && jathival.indexOf(searchpatt[1])!=-1
                    ){
                        qualified=true;
                    }
                    else if(searchval.trim().length!=0 && searchval=="*")
                    {
                        qualified=true;
                    }
                    
            }
            else{
                qualified=true;
            }

            
            if(qualified==true){
                var item= "<span class='jathi' files='"+jathi.list.join("|")+"'>"+jathi.pattern+"_"+jathi.text.replace(".mp3","")+"</span><span class='movebutton ignoreclick'>&nbsp;<b class='ignoreclick'>>></b></span><br>"
                $(".jathilist").append(item);
            }
            
        }

    }

}


$(document).ready(function(){
    // Removed login dependency
    initializeobjects();
});