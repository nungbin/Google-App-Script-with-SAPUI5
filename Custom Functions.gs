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
