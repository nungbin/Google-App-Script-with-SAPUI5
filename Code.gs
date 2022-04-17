// Google APP Script: https://developers.google.com/apps-script/guides/html#index.html
// SAPUI5: https://sapui5.hana.ondemand.com/1.30.8/docs/guide/592f36fd077b45349a67dcb3efb46ab1.html

function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
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
