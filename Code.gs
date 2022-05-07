// Google APP Script: https://developers.google.com/apps-script/guides/html#index.html
// SAPUI5: https://sapui5.hana.ondemand.com/1.30.8/docs/guide/592f36fd077b45349a67dcb3efb46ab1.html
// Script files (.gs) run on the server side


// URL parameter example
// yourUrl/?a=1&b=2&c=3&c=4
//function doGet(e){
//  e.queryString // will be a=1&b=2&c=3&c=4
//  e.parameter; // will be {"a": "1", "b": "2", "c": "3"}. For parameters that have multiple values, this only returns the first value
//  e.parameters; // will be {"a": ["1"], "b": ["2"], "c": ["3", "4"]}. Returns array of values for each key.
//}
var gVerifiedUser;

function doGet(e) {
  Logger.log(e.parameter.user);
  Logger.log(Session.getActiveUser().getEmail());

  if (Object.keys(e.parameter).length > 0) {
    //check if there is a user parameter
    if (e.parameter.user !== undefined &&
        e.parameter.user !== "") {
      if ( verifyUser("Login", e.parameter.user) ) {
        gVerifiedUser = e.parameter.user;
        // evaluate(): needed so '<?!= include ?>' will work. https://youtu.be/1toLqGwMRVc?t=957
        // the below line is learned from https://www.youtube.com/watch?v=RJtaMJTlRhE&t=234s
        let template = HtmlService.createTemplateFromFile('index');
        template = prepareDataForHTML(template);
        return template.evaluate()
                       .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
                       .addMetaTag('viewport', 'width=device-width, initial-scale=1');
        //return HtmlService.createHtmlOutputFromFile('index.html');
      }
    }
  }

  // provide a login form
  // credit goes to: https://github.com/choraria/google-apps-script/tree/master/Login%20Dashboard
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
  pTemplate.appTitle       = "My Title";  // use this technique to pass variables from Server side to CLient side
  pTemplate.splashMessage  = "Loading UI5 framework... This could take up to 1-2 mins to finish.";
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


// https://gist.github.com/clayperez/0d689b02693b2e94a7d1ddea98a0571c?permalink_comment_id=3579624#gistcomment-3579624
function uniqueId() {
  const uID = Utilities.getUuid();
  Logger.log(uID);
  return uID;
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
  
  if ( matchedValue !== "" ) {
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


function insertIngredientToDatabase(pStore, pIngredient) {
  let arrayIngredient=[],
      matchedValue,
      matchedColumn=0;
  let lStore      = pStore || 'Costco';
  let lIngredient = pIngredient || 'test';
  const textFinder = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Ingredient Database").createTextFinder(lStore);
  textFinder.matchCase(false);
  const arrayMatch = textFinder.findAll();
  for (const i=0 ; i<arrayMatch.length ; i++) {
    matchedValue  = arrayMatch[i].getValue();
    matchedColumn = arrayMatch[i].getColumn();
    break;
  }
  if ( matchedColumn > 0 ) {
    const sSheetName = "Ingredient Database";
    const rRange     = "B2:B";
    let lSheet   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sSheetName );
    let lLastRow = lSheet.getRange(rRange).getNextDataCell(SpreadsheetApp.Direction.DOWN).getLastRow();
    lLastRow++;
    lSheet.getRange(lLastRow, 1).setFormula("=custConcat(B"+ lLastRow + ", C" + lLastRow + ", D" + lLastRow + ")");
    lSheet.getRange(lLastRow, 2).setValue(lIngredient);
    lSheet.getRange(lLastRow, matchedColumn).setValue('x');
    arrayIngredient.push(lIngredient);

    Logger.log(lLastRow);
    Logger.log(matchedColumn);
  }
  return arrayIngredient;
}


function appendGroceryToSheet(pSheet, pDataArray) {
  const sRange = "A1:D";
  let lDate = new Date();
  const lVerifiedUser = Session.getActiveUser().getEmail() || gVerifiedUser;

  const lSheet = pSheet || "Grocery";
  //pDataArray = [];
  //pDataArray.push("1");
  //pDataArray.push("2");
  //pDataArray.push("3");
  pDataArray.push(uniqueId());
  pDataArray.push(lVerifiedUser);
  pDataArray.push(lDate.toLocaleString());
  
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lSheet).appendRow(pDataArray);

  const oSheet   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lSheet);
  const lLastRow = oSheet.getRange(sRange).getNextDataCell(SpreadsheetApp.Direction.DOWN).getLastRow();
  const oData    = oSheet.getRange(sRange + lLastRow).getValues();
  
  let oResult = [];
  for ( i=1 ; i<oData.length ; i++ ) {
    oResult.push({ 
                   "Store"      : oData[i][0],
                   "Ingredient" : oData[i][1],
                   "Recipe"     : oData[i][2],
                   "UID"        : oData[i][3],
                   "rowNo"      : i + 1
                });
  }
  return oResult;
}


function retrieveGrocery(pSheet) {
  const sRange = "A1:D";
  const lSheet = pSheet || "Grocery";

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
    if ( oData[i][0] !== "" ||
         oData[i][1] !== "" || 
         oData[i][2] !== "" ) {
      oResult.push({ 
                     "Store"      : oData[i][0],
                     "Ingredient" : oData[i][1],
                     "Recipe"     : oData[i][2],
                     "UID"        : oData[i][3],
                     "dirtyRow"   : false,
                     "rowNo"      : i + 1
                  });
    }
  }
  Logger.log(oResult);
  return oResult;  
}


//function insertOneRowInGroceryHistory(pSheet, pRowIndex) {
//  const lSheet = pSheet || "Grocery History";
//  const lRowIndex = pRowIndex || 2;
//  const oSheet   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lSheet);
//  oSheet.insertRows(lRowIndex, 1);
//}


function retrieveGroceryHistory(pSheet) {
  const listLimit = 20;
  const sRange = "A1:H";
  const lSheet = pSheet || "Grocery History";

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
    if ( i > listLimit ) {
      // only retrieve listLimit number of items
      break;
    }
    if ( oData[i][0] != "" ||
         oData[i][1] != "" || 
         oData[i][2] != "" ) {
      oResult.push({ 
                     "Store"      : oData[i][0],
                     "Ingredient" : oData[i][1],
                     "Recipe"     : oData[i][2],
                     "UID"        : oData[i][3],
                     "ChangedOn"  : oData[i][7],
                     "rowNo"      : i + 1
                  });
    }
  }
  return oResult;  
}


function moveGroceryToHistory(pGrocerySheet, pRowToDelete, pHistorySheet, pRowToInsert) {
  const lVerifiedUser = Session.getActiveUser().getEmail() || gVerifiedUser;
  const lDate = new Date();
  const lGrocerySheet = pGrocerySheet || "Grocery";
  const lHistorySheet = pHistorySheet || "Grocery History";
  const lRowToDelete  = pRowToDelete || 2; 
  const lRowtoInsert  = pRowToInsert || 2;
  const sGrocerySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lGrocerySheet);
  const sHistorySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lHistorySheet);
  sHistorySheet.insertRowBefore(lRowtoInsert);
  sGrocerySheet.getRange("A" + lRowToDelete + ":F" + lRowToDelete).copyTo(sHistorySheet.getRange("A" + lRowtoInsert + ":F" + lRowtoInsert), SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
  sHistorySheet.getRange("G" + lRowtoInsert).setValue(lVerifiedUser);
  sHistorySheet.getRange("H" + lRowtoInsert).setValue(lDate.toLocaleString());
  sGrocerySheet.deleteRow(lRowToDelete);
}


function moveHistoryToGrocery(pHistorySheet, pRowsArray, pGrocerySheet) {
  //pRowsArray = [];
  //pRowsArray.push(2);
  //pRowsArray.push(3);

  const lDate = new Date();
  const lGrocerySheet = pGrocerySheet || "Grocery";
  const lHistorySheet = pHistorySheet || "Grocery History";
  //const sGrocerySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lGrocerySheet);
  const sHistorySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lHistorySheet);
  pRowsArray.forEach((row) => {
    let rowData=[];
    rowData.push(sHistorySheet.getRange("A"+row).getValue());
    rowData.push(sHistorySheet.getRange("B"+row).getValue());
    rowData.push(sHistorySheet.getRange("C"+row).getValue());
    appendGroceryToSheet(lGrocerySheet, rowData);
  })
}


function saveRecipe(pSheet, pRow, pRecipe) {
  const lSheet  = pSheet || "Grocery";
  const lRow    = pRow   || 2;
  const lRecipe = pRecipe || "test";

  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lSheet).getRange("C" + lRow).setValue(lRecipe);
}


function verifyUser(pSheet, pUser) {
  var lFound = false;
  const lSheet = pSheet || "Login";
  const lUser  = pUser;
  // const lUser  = pUser || "Bshu";
  const textFinder = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lSheet).getRange("A2:A").createTextFinder(lUser);
  textFinder.matchCase(true);
  textFinder.matchEntireCell(true);
  const arrayMatch = textFinder.findAll();
  if ( arrayMatch.length > 0 ) {
    //arrayMatch.forEach((user) => {
    //  Logger.log(user.getValue());
    //})
    lFound = true;
  }
  Logger.log(lFound);
  return lFound;
}


function compareGrocery(pSheet, pStore, pIngredient) {
  var lMatched = false;
  const lSheet = pSheet || "Grocery";
  const lStore = pStore || "Costco";
  const lIngredient = pIngredient || "Milk";
  // compare store first
  const textFinder = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lSheet).getRange("A2:A").createTextFinder(lUser);
}


// alasql has some constrains. If column name is part of keywords, ex: 'store', it throws a parsing error.
function checkIfStoreIngredientExist(pSheet, pStore, pIngredient) {
  var lResult = false;
  var oResult = [];
  const lSheet = pSheet || "Grocery";
  //const lStore = pStore || "Costco";
  //const lIngredient = pIngredient || "MMM";
  const oSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lSheet);
  const oRange = oSheet.getRange("A1").getDataRegion().getValues();

  try {
    oResult = SUPERSQL(`SELECT * FROM ? WHERE Storename = '${lStore}' AND Ingredient LIKE '%${lIngredient}%'`, oRange);
  } catch (error) {
  }
  if (oResult.length) {
    lResult = true;
  }
  return lResult;
}