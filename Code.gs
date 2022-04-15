// Google APP Script: https://developers.google.com/apps-script/guides/html#index.html
// SAPUI5: https://sapui5.hana.ondemand.com/1.30.8/docs/guide/592f36fd077b45349a67dcb3efb46ab1.html

function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate();
  //return HtmlService.createHtmlOutputFromFile('index.html');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
};
