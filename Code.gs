// Google APP Script: https://developers.google.com/apps-script/guides/html#index.html
// SAPUI5: https://sapui5.hana.ondemand.com/1.30.8/docs/guide/592f36fd077b45349a67dcb3efb46ab1.html
// Script files (.gs) run on the server side

function doGet(e) {
  Logger.log(e.parameter);

  // evaluate(): needed so '<?!= include ?>' will work. https://youtu.be/1toLqGwMRVc?t=957
  // the below line is learned from https://www.youtube.com/watch?v=RJtaMJTlRhE&t=234s
  let template = HtmlService.createTemplateFromFile('index');
  template = prepareDataForHTML(template);
  return template.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  //return HtmlService.createHtmlOutputFromFile('index.html');
}


function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
};


function fileRead(pFileId) {
  var oFileBlob;
  let Id = pFileId || '1PNAcp3zDFtTN8i33b5LjtfIR2GcfmOu0';

  try{
    let oFile = DriveApp.getFileById(Id);  // return file name
    oFileBlob = oFile.getBlob().getDataAsString();
    // Logger.log(oFileBlob);
  }
  catch (e) {
    Logger.log(e);
  }
  return oFileBlob;
}


function prepareDataForHTML(pTemplate) {
  pTemplate.appTitle      = "My Title";  // use this technique to pass variables from Server side to CLient side
  pTemplate.splashMessage = "Loading document... This could take up to 1-2 mins to finish.";
  return pTemplate;
}


function getRangeData(pSheet, pRange) {
  let oData, oData1;

  // pSheet = ""; pRange="D20:D22";
  
  if ( pSheet === "" ) {
    oData = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(pRange).getValues();
  }
  else {
    oData = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(pSheet).getRange(pRange).getValues();
  }
  if ( Array.isArray(oData) === true ) {
    // https://youtu.be/f9dqsHDrQCc?t=1340
    // convert two dimensional array to one dimensional array
    oData1 = oData.map(function(r) { return r[0]; });
  }
  return oData1;
}


function saveToSheet(pData) {
  let oArr = [];

  oArr.push(pData);
  var ss = SpreadsheetApp.getActiveSheet().appendRow(oArr);
}
