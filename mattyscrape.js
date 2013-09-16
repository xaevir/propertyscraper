var links = [];
var casper = require('casper').create();
var utils = require('utils');
var fs = require('fs'); 
var root = 'https://www.taxpayerservicecenter.com/'

function getLinks() {
  var links = document.querySelectorAll('.aLink');
  return Array.prototype.map.call(links, function(e) {
    return e.getAttribute('href');
  });
}

function nextLink() {
  casper.page.injectJs('jquery.js');
  this.evaluate(function(){
    var link = $('a:contains("next")')
    if (link.length !== 0) {
      casper.click(link)
      casper.then(function() {
        links = this.evaluate(getLinks);
      })
    }
  });
}

casper.start('https://www.taxpayerservicecenter.com/RP_Search.jsp?search_type=Assessment', function() {
  this.fill('form#SearchForm', {
    'selectNbhdCode':    '36',
    'selectUseCode':     '021'
  }, true);
});

casper.then(function() {
  links = this.evaluate(getLinks);
  //casper.page.injectJs('jquery.js');

});

casper.then(function() {
  casper.each(links, function(self, link) {
    self.thenOpen(root + link, function() {
      //console.log('new location is ' + this.getCurrentUrl());
      casper.page.injectJs('jquery.js');
      var data =  this.evaluate(function(){
        var data = {}
        data.address = $('form#form1 font:contains("Address:")').parent().parent().next().text()
        data.ssl = $('form#form1 font:contains("SSL:")').parent().parent().next().text()
        data.ssl = data.ssl.replace(/\s{2,}/g, ' ');
        data.owner = $('form#form1 td:contains("Owner Name:")').next().text()
        data.mailing = $('form#form1 td:contains("Mailing Address:")').next().text()
        return data
      });
      this.echo( data.address + '\t' + data.ssl + '\t' + data.owner + '\t' + data.mailing );
    });
  });
});


casper.run(function() {
  //this.echo(links2.length + ' links found:');
  //this.echo(' - ' + links2.join('\n - ')).exit();
});

//this.echo(this.getTitle());
//fs.write(myfile, myData, 'w');
//return $('font:contains("Address:")');
//return $('form table tbody tr td table tbody tr td:nth-child(2)').text()

//var address_selector = 'form table tbody tr td table tbody tr td:nth-child(2)'
//var address_info = this.getElementInfo(address_selector); 

