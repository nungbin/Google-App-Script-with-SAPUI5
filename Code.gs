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

function doGet(e) {
  Logger.log(e.parameter.user);
  Logger.log(Session.getActiveUser().getEmail());

  if (Object.keys(e.parameter).length > 0) {
    //check if there is a user parameter
    if (e.parameter.user !== undefined &&
        e.parameter.user !== "") {
      if ( verifyUser("Login", e.parameter.user) ) {
        PropertiesService.getScriptProperties().setProperty('gVerifiedUser', e.parameter.user);
        // evaluate(): needed so '<?!= include ?>' will work. https://youtu.be/1toLqGwMRVc?t=957
        // the below line is learned from https://www.youtube.com/watch?v=RJtaMJTlRhE&t=234s
        let template = HtmlService.createTemplateFromFile('index');
        template = prepareDataForHTML(template);
        // 'evaluate' takes time to complete
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
  const sIngreCol = "B";
  const text = pStore || "Home Depot";
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
    let lSheet   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sSheetName );
    let oData = lSheet.getRange("A1").getDataRegion().getValues();
    oData.forEach((row, i) => {
      if ( i > 0 ) {
        if ( row[matchedColumn-1] === 'x' ) {       
          matched.push({
            ingre: custConcat(row[1], row[2], row[3]),
            url:   lSheet.getRange(sIngreCol + (i + 1)).getRichTextValue().getLinkUrl()
          });    
        }
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
  const cIngreCol = "B";
  let sIngreCol;
  let sURL = null;
  let sIngre;
  let lDate = new Date();
  const lVerifiedUser = PropertiesService.getScriptProperties().getProperty('gVerifiedUser') || 
                        Session.getActiveUser().getEmail();

  const lSheet = pSheet || "Grocery";
  //pDataArray = [];
  //pDataArray.push("test1");
  //pDataArray.push("test2");
  //pDataArray.push("test3");
  //pDataArray.push("");
  pDataArray.push(uniqueId());
  pDataArray.push(lVerifiedUser);
  pDataArray.push(lDate.toLocaleString("en-US", {timeZone: "America/Edmonton"}));

  // Insert URL
  sIngre = pDataArray[1];
  sURL = pDataArray[3];
  pDataArray.splice(3,1);

  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lSheet).appendRow(pDataArray); 

  const oSheet   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lSheet);
  const lLastRow = oSheet.getRange(sRange).getNextDataCell(SpreadsheetApp.Direction.DOWN).getLastRow();
  const oData    = oSheet.getRange(sRange + lLastRow).getValues();
  sIngreCol = cIngreCol + lLastRow;
  if (sURL !== undefined && sURL !== null && sURL !== "") {
    setIngredientURL(lSheet, sIngreCol, sIngre, sURL);
  }

  let oResult = [];
  for ( i=1 ; i<oData.length ; i++ ) {
    sIngreCol = cIngreCol + (i+1);
    sURL = getIngredientURL(lSheet, sIngreCol);
    if (sURL === undefined || sURL === null) {
      sURL = "";
    }
    oResult.push({ 
                   "Store"      : oData[i][0],
                   "Ingredient" : oData[i][1],
                   "Recipe"     : oData[i][2],
                   "UID"        : oData[i][3],
                   "URL"        : sURL,
                   "dirtyRow"   : -1,
                   "rowNo"      : i + 1
                });
  }
  return oResult;
}


function retrieveGrocery(pSheet) {
  const lVerifiedUser = PropertiesService.getScriptProperties().getProperty('gVerifiedUser') || 
                        Session.getActiveUser().getEmail();
  const cIngreCol = "B";
  let sIngreCol;
  let sURL = null;
  const sRange = "A1";
  const lSheet = pSheet || "Grocery";
  const oSheet   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lSheet);
  const oData    = oSheet.getRange(sRange).getDataRegion().getValues();
  
  let oResult = [];
  for ( i=1 ; i<oData.length ; i++ ) {
    if ( oData[i][0] === "" &&
         oData[i][1] === "" && 
         oData[i][2] === "" ) {
      break;
    }
 
    sIngreCol = cIngreCol + (i+1);
    sURL = getIngredientURL(lSheet, sIngreCol);
    if (sURL === undefined || sURL === null) {
      sURL = "";
    }
    if ( lVerifiedUser === "" ||
         lVerifiedUser === undefined ||
         lVerifiedUser === null ) {
      if ( oData[i][4] === "" ) {
        // demo purpose
        if ( oData[i][0] !== "" ||
            oData[i][1] !== "" || 
            oData[i][2] !== "" ) {
          oResult.push({ 
                        "Store"      : oData[i][0],
                        "Ingredient" : oData[i][1],
                        "Recipe"     : oData[i][2],
                        "UID"        : oData[i][3],
                        "URL"        : sURL,
                        "dirtyRow"   : -1,
                        "rowNo"      : i + 1
                      });
        }
      }
    } else {
      if ( oData[i][4] !== "" ) {
        // productivity purpose
        if ( oData[i][0] !== "" ||
            oData[i][1] !== "" || 
            oData[i][2] !== "" ) {
          oResult.push({ 
                        "Store"      : oData[i][0],
                        "Ingredient" : oData[i][1],
                        "Recipe"     : oData[i][2],
                        "UID"        : oData[i][3],
                        "URL"        : sURL,
                        "dirtyRow"   : -1,
                        "rowNo"      : i + 1
                      });
        }
      }
    }
  }
  return oResult;  
}


function retrieveGroceryHistory(pSheet) {
  const lVerifiedUser = PropertiesService.getScriptProperties().getProperty('gVerifiedUser') || 
                        Session.getActiveUser().getEmail();
  const listLimit = 20;
  const cIngreCol = "B";
  let sIngreCol;
  let sURL = null;
  const sRange = "A1";
  const lSheet = pSheet || "Grocery History";
  const oSheet   = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lSheet);
  const oData    = oSheet.getRange(sRange).getDataRegion().getValues();
  
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

    sIngreCol = cIngreCol + (i+1);
    sURL = getIngredientURL(lSheet, sIngreCol);
    if (sURL === undefined || sURL === null) {
      sURL = "";
    }
    if ( lVerifiedUser === "" ||
         lVerifiedUser === undefined ||
         lVerifiedUser === null ) {
      if ( oData[i][4] === "" ) {
        // demo purpose
        if ( oData[i][0] != "" ||
            oData[i][1] != "" || 
            oData[i][2] != "" ) {
          oResult.push({ 
                        "Store"      : oData[i][0],
                        "Ingredient" : oData[i][1],
                        "Recipe"     : oData[i][2],
                        "UID"        : oData[i][3],
                        "URL"        : sURL,
                        "ChangedOn"  : oData[i][7],
                        "rowNo"      : i + 1
                      });
        }      
      }
    } else {
      if ( oData[i][4] !== "" ) {
        // productivity purpose
        if ( oData[i][0] != "" ||
            oData[i][1] != "" || 
            oData[i][2] != "" ) {
          oResult.push({ 
                        "Store"      : oData[i][0],
                        "Ingredient" : oData[i][1],
                        "Recipe"     : oData[i][2],
                        "UID"        : oData[i][3],
                        "URL"        : sURL,
                        "ChangedOn"  : oData[i][7],
                        "rowNo"      : i + 1
                      });            
        }
      }
    }
  }
  return oResult;  
}


function moveGroceryToHistory(pGrocerySheet, pRowToDelete, pHistorySheet, pRowToInsert) {
  const lVerifiedUser = PropertiesService.getScriptProperties().getProperty('gVerifiedUser') || 
                        Session.getActiveUser().getEmail();
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

  let sURL = "";
  const cIngreCol = "B";
  const lDate = new Date();
  const lGrocerySheet = pGrocerySheet || "Grocery";
  const lHistorySheet = pHistorySheet || "Grocery History";
  //const sGrocerySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lGrocerySheet);
  const sHistorySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lHistorySheet);
  pRowsArray.forEach((row) => {
    sIngreCol = cIngreCol + row;
    sURL = getIngredientURL(lHistorySheet, sIngreCol);
    if (sURL === undefined || sURL === null) {
      sURL = "";
    }

    let rowData=[];
    rowData.push(sHistorySheet.getRange("A"+row).getValue());
    rowData.push(sHistorySheet.getRange("B"+row).getValue());
    rowData.push(sHistorySheet.getRange("C"+row).getValue());
    rowData.push(sURL);
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


// alasql has some constrains. If column name is part of keywords, ex: 'store', it throws a parsing error.
function checkIfStoreIngredientExist(pSheet, pStore, pIngredient) {
  var lResult = false;
  var oResult = [];
  const lSheet = pSheet || "Grocery";
  const lStore = pStore || "Costco";
  const lIngredient = pIngredient || "MMM";
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


// https://gist.github.com/tanaikech/d39b4b5ccc5a1d50f5b8b75febd807a6
function getIngredientURL(pSheet, pIngreRange) {
  const lSheet = pSheet || 'Ingredient Database';
  const lIngreRange = pIngreRange || 'B33';
  let sURL = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lSheet).getRange(lIngreRange).getRichTextValue().getLinkUrl();
  return sURL;
}


function setIngredientURL(pSheet, pIngreRange, pIngre, pIngreURL) {
  const lSheet = pSheet || 'Store';
  const lRange = pIngreRange || 'F10';
  const lIngre = pIngre || "testIngre";
  const lIngreURL = pIngreURL || 'https://www.google.com';
  const oRichText = SpreadsheetApp.newRichTextValue()
      .setText(lIngre)
      .setLinkUrl(lIngreURL)
      .build();
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(lSheet).getRange(lRange).setRichTextValue(oRichText);
}