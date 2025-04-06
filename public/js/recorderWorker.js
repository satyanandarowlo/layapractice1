var recLength = 0,
  recBuffers = [],
  sampleRate;

  var calculatedrecLength=0;
var isrecording=false;
var deleteOldRecords=true;

this.onmessage = function(e){
  switch(e.data.command){
    case 'init':
      init(e.data.config);
      break;
    case 'record':
      record(e.data.buffer);
      break;
      case 'getStatus':
      getStatus();
      break;
      case 'getRecBuffersLength':
      getRecBuffersLength();
      break;
    case 'exportWAV':
      exportWAV(e.data.type,e.data.timedetail);
      break;
    case 'exportAudio':
    exportAudio(e.data.type,e.data.timedetail);
      break;
    case 'getBuffer':
      getBuffer(e.data.timedetail);
      break;
    case 'getSavedArray':
      getSavedArray();
      break;
    case 'clear':
      clear();
      break;
  }
};

function init(config){
  sampleRate = config.sampleRate;
  deleteOldRecords = config.deleteOldRecords;

}

function getStatus()
{
  this.postMessage(isrecording); 
}

function getRecBuffersLength()
{
  this.postMessage({recBuffers:recBuffers,recBuffersLength: recBuffers.length, recLength:recLength});
}

function calculateRecLength()
{
  var reclocallength = 0;
  recBuffers.forEach(function(item){
    reclocallength+=item.interleaved.length;
  });
  return reclocallength;
}

function fndeleteOldEntries(){
  if(deleteOldRecords==true)
  {
    var timenow = Date.now();
    for( var i=0;i<recBuffers.length;i++){
      var item = recBuffers[i];
      //deleting records older than last 10 seconds
      if(timenow-item.recordtimestamp>30000)
      {
        recBuffers.splice(0,1);
      }
    }
  }
}

function record(inputBuffer){
  var bufferL = inputBuffer[0];
  var bufferR = inputBuffer[1];
  var recordtimestamp = inputBuffer[2];
  var interleaved = interleave(bufferL, bufferR);
  recBuffers.push({interleaved:interleaved,recordtimestamp:recordtimestamp});
  recLength += calculateRecLength();
  fndeleteOldEntries();
  isrecording=true;
}
var starttime=0;
var endtime=0;
function exportWAV(type,timedetail){
    if(typeof(timedetail)!="undefined")
    {
        starttime=timedetail[0];
        endtime=timedetail[1];
    }
  var buffer = mergeBuffers(recBuffers, recLength);
  var dataview = encodeWAV(buffer);
  var audioBlob = new Blob([dataview], { type: type });

  this.postMessage(audioBlob);
}

function exportAudio(type,timedetail){
    if(typeof(timedetail)!="undefined")
    {
        starttime=timedetail[0];
        endtime=timedetail[1];
    }
  var buffer = mergeBuffers(recBuffers, recLength);
  var dataview = encodeWAV(buffer);
  var audioBlob = new Blob([dataview], { type: type });
  const audioUrlz = URL.createObjectURL(audioBlob);
  //var newaudiofile = new Audio(audioUrlz);

  this.postMessage(audioUrlz);
}

function getBuffer(timedetail) {
    if(typeof(timedetail)!="undefined")
    {
        starttime=timedetail[0];
        endtime=timedetail[1];
    }
  var buffer = mergeBuffers(recBuffers, recLength)
  this.postMessage(buffer);
}

function getSavedArray()
{
    this.postMessage(recBuffers);
}

function clear(){
  recLength = 0;
  recBuffers = [];
  isrecording=false;
}

function mergeBuffers(recBuffers, recLength){
  //var result = new Float32Array(recLength);
  var variableLength =0;
  var startindex=0;
  var endindex=0;
  var offset = 0;

  for (var i = 0; i < recBuffers.length; i++){
    var bufferobject = recBuffers[i];
    if((starttime==0&&endtime==0) 
    || (starttime!=0&&endtime!=0&&bufferobject.recordtimestamp>starttime&&bufferobject.recordtimestamp<endtime)
    || (starttime==0&&endtime!=0&&bufferobject.recordtimestamp<endtime)
    || (starttime!=0&&endtime==0&&bufferobject.recordtimestamp>starttime))
    {
        if(startindex==0)
        startindex=i;
        endindex=i;

        variableLength += bufferobject.interleaved.length;
    }
    
    
  }

  var result = new Float32Array(variableLength);

  for (var i = startindex; i < endindex; i++){
    var bufferobject = recBuffers[i];
    result.set(bufferobject.interleaved, offset);
    offset += bufferobject.interleaved.length;
  }
  return result;
}

function interleave(inputL, inputR){
  var length = inputL.length + inputR.length;
  var result = new Float32Array(length);

  var index = 0,
    inputIndex = 0;

  while (index < length){
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function floatTo16BitPCM(output, offset, input){
  for (var i = 0; i < input.length; i++, offset+=2){
    var s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function writeString(view, offset, string){
  for (var i = 0; i < string.length; i++){
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function encodeWAV(samples){
  var buffer = new ArrayBuffer(44 + samples.length * 2);
  var view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 32 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, 2, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 4, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 4, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);

  return view;
}