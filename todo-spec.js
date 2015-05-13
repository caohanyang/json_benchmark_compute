describe('Protractor Demo App', function() {
  var size = element(by.model('size'));
  var probability = element(by.model('probability'));
  var algorithm = element(by.model('algorithm'));
  var seed = element(by.model('seed'));
  var goButton = element(by.id('gobutton'));
  var latestResult = element(by.binding('mark'));

  beforeEach(function() {
    browser.get('http://localhost:8080');
    //browser.get('http://ghostblog-213388.euw1-2.nitrousbox.com:8080/');
  });
  
  var algorithmArr = [0, 1, 2, 3, 4];
  var sizeArr = ["small", "medium", "large"];
  var probabilityArr = [[0.08, 0.2, 0.5], [0.05, 0.2, 0.4], [0.05, 0.2, 0.39]];
  var num;

it("do the test", function() {
   for(var s=0; s<sizeArr.length; s++) {
       for(var p=0; p<probabilityArr[s].length; p++) {
         for(var a=0; a<algorithmArr.length; a++) {
               add(algorithmArr[a], sizeArr[s], probabilityArr[s][p]); 
        }
     }
  }         

});

function add(a, s, p) {
    algorithm.sendKeys(a);
    size.sendKeys(s);
    probability.sendKeys(p);
    goButton.click();
    expect(latestResult.getText()).toEqual('ok');
}

});