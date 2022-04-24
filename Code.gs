// Google APP Script: https://developers.google.com/apps-script/guides/html#index.html
// SAPUI5: https://sapui5.hana.ondemand.com/1.30.8/docs/guide/592f36fd077b45349a67dcb3efb46ab1.html
// Script files (.gs) run on the server side

function doGet(e) {
  Logger.log(e.parameter);
  Logger.log(Session.getActiveUser().getEmail());

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
  let xmlViewsFromGS = getRangeData("XML Views", "B2:B", "", true);

  pTemplate.appTitle       = "My Title";  // use this technique to pass variables from Server side to CLient side
  pTemplate.splashMessage  = "Loading document... This could take up to 1-2 mins to finish.";
  pTemplate.xmlViewsFromGS = xmlViewsFromGS;
  return pTemplate;
}


function getRangeData(pSheet, pRange, pFieldName, pLastRow) {
  let oData, oData1;

  // pSheet = "Store"; pRange="A2:A";  pFieldName=""; pLastRow = true;
  
  if ( pLastRow === true ) {
    let lSheet   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(pSheet);
    // pRange="A2:A"
    let lLastRow = lSheet.getRange(pRange).getNextDataCell(SpreadsheetApp.Direction.DOWN).getLastRow();
    oData        = lSheet.getRange(pRange + lLastRow).getValues();
  } else {
    if ( pSheet === "" ) {
      oData = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(pRange).getValues();
    }
    else {
      oData = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(pSheet).getRange(pRange).getValues();
    }
  }
  if ( Array.isArray(oData) === true ) {
    // https://youtu.be/f9dqsHDrQCc?t=1340
    // convert two dimensional array to one dimensional array
    if ( pFieldName === "" ) {
      oData1 = oData.map(function(r) { return r[0]; });  
    }
    else {
      oData1 = oData.map(function(r) {
        let t = {};

        t[pFieldName] =  r[0]; 
        return t; 
      }); 
    }
  }
  return oData1;
}


function getIngredientsPerStore(pStore) {
  const text = pStore || "Superstore";
  const textFinder = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Ingredient Database").createTextFinder(text);
  let   matched = [],
        matchedValue,
        matchedColumn;
  textFinder.matchCase(false);
  const arrayMatch = textFinder.findAll();
  
  for (const i=0 ; i<arrayMatch.length ; i++) {
    matchedValue  = arrayMatch[i].getValue();
    matchedColumn = arrayMatch[i].getColumn();
    break;
  }
  
  if ( matchedValue != "" ) {
    const sSheetName = "Ingredient Database";
    const rRange     = "A2:H";
    let lSheet   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sSheetName );
    let lLastRow = lSheet.getRange(rRange).getNextDataCell(SpreadsheetApp.Direction.DOWN).getLastRow();
    let oData    = lSheet.getRange(rRange + lLastRow).getValues();
    oData.forEach((row) => {
      if ( row[matchedColumn-1] === 'x' ) {
        matched.push(row[0]);       
      }
    })
  }
  Logger.log(matched);
  return matched;
}


function saveToSheet(pData) {
  let rowData = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange("A1:C1").getValues();

  let oArr = [];
  oArr.push("1");
  oArr.push("2");
  oArr.push("3");
  SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().appendRow(oArr);
}


