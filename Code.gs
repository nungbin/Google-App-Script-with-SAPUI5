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
  pTemplate.splashMessage  = "Loading UI5 framework... This could take up to 1-2 mins to finish.";
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
        const lResult = custConcat(row[1], row[2], row[3]);
        
        matched.push(lResult);
        //matched.push(row[0]);       
      }
    })
  }
  Logger.log(matched);
  return matched;
}


function appendGroceryToSheet(pSheet, pDataArray) {
  const sRange = "A1:C";
  let lDate = new Date();

  const lSheet = pSheet || "Result";
  //pDataArray = [];
  //pDataArray.push("1");
  //pDataArray.push("2");
  //pDataArray.push("3");
  pDataArray.push(Session.getActiveUser().getEmail());
  pDataArray.push(lDate.toLocaleString());
  
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lSheet).appendRow(pDataArray);

  const oSheet   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lSheet);
  const lLastRow = oSheet.getRange(sRange).getNextDataCell(SpreadsheetApp.Direction.DOWN).getLastRow();
  const oData    = oSheet.getRange(sRange + lLastRow).getValues();
  
  let oResult = [];
  for ( i=1 ; i<oData.length ; i++ ) {
    oResult.push({ "Store"      : oData[i][0],
                   "Ingredient" : oData[i][1],
                   "Recipe"     : oData[i][2]
                });
  }
  return oResult;
}


function retrieveGrocery(pSheet) {
  const sRange = "A1:C";
  const lSheet = pSheet || "Result";

  const oSheet   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lSheet);
  const lLastRow = oSheet.getRange(sRange).getNextDataCell(SpreadsheetApp.Direction.DOWN).getLastRow();
  const oData    = oSheet.getRange(sRange + lLastRow).getValues();
  
  let oResult = [];
  for ( i=1 ; i<oData.length ; i++ ) {
    if ( oData[i][0] === "" &&
         oData[i][1] === "" && 
         oData[i][2] === "" ) {
      break;
    }
    if ( oData[i][0] != "" ||
         oData[i][1] != "" || 
         oData[i][2] != "" ) {
      oResult.push({ "Store"      : oData[i][0],
                     "Ingredient" : oData[i][1],
                     "Recipe"     : oData[i][2]
                  });
    }
  }
  Logger.log(oResult);
  return oResult;  
}
