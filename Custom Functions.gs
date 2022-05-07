function custConcat(...args) {
  let resultStr="";
  //args.push("AA");
  //args.push("");
  //args.push("CC");
  
  args.forEach((arg) => {
    if ( arg != 'undefined' && arg != "" ) {
      if ( resultStr === "" ) {
        resultStr = arg;
      }
      else {
        if ( resultStr.slice(-1) === ")" ) {
          resultStr = resultStr.slice(0, -1) + "/" + arg + ")";
        } 
        else {
          resultStr = resultStr + " (" + arg + ")";
        }  
      }
    }
  })
  return resultStr;
}


function testValidate(pFileId) {
  const lFileId = pFileId || '168hU-4S2-2BTTfEHGOV7hBAVcmcC2Q4rYTJ8U6pFFLI';

  var file;
  try {
    file = DriveApp.getFileById(lFileId);
  }catch(e){
    return false; // If user has no access.
  }

  const lEditors = file.getViewers().map(editor => {
    return editor.getEmail();
  })
  Logger.log(lEditors);
}
