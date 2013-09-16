var links = [];
var utils = require('utils');
var fs = require('fs'); 
var root = 'https://www.taxpayerservicecenter.com/'
var casper = require("casper").create({
    clientScripts:[ "jquery.js"],
    //verbose:true,
    logLevel: 'info',
    pageSettings:{
        loadImages:false,
        loadPlugins:false,
        javascriptEnabled:true,
    }
});

var hood_id = casper.cli.get('id')
if (!hood_id) {
  casper.echo("You need to pass in neighborhood id as argument to this code.");
  casper.exit();
}



function getLinks() {
  var links = document.querySelectorAll('.aLink');
  return Array.prototype.map.call(links, function(e) {
    return e.getAttribute('href');
  });
}

function hasNextLink() {
  var href = this.evaluate(function (){
    var link = $('a:contains("next")')
    return (link.length !== 0) ? link.attr('href') : false
  });
  this.log('link href: ' + href, 'warning')
  return href
}

function traverse() {
  var link = hasNextLink.call(this)
  if (link) {
    this.thenOpen(root + link, function() {
      links = links.concat(this.evaluate(getLinks));
      this.log(links.length + ' links found:', 'warning');
      traverse.call(this)
    })
  }
}

casper.start('https://www.taxpayerservicecenter.com/RP_Search.jsp?search_type=Assessment', function start() {
  this.fill('form#SearchForm', {
    'selectNbhdCode':    hood_id,
    'selectUseCode':     '021'
  }, true);
});

casper.then(function secondStep() {
  links = this.evaluate(getLinks);
  this.log(links.length + ' links found 1:', 'warning');
  traverse.call(this)
});

casper.then(function() {
  var i = 1
  casper.each(links, function(self, link) {
    self.thenOpen(root + link, function() {
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
      this.echo(i + '\t' + data.address + '\t' + data.ssl + '\t' + data.owner + '\t' + data.mailing );
      i++
    });
  });
});

casper.on("remote.message", function(message) {
  this.echo(message);
});



casper.run(function() {
  this.exit(); 
});

//fs.write(myfile, myData, 'w');
//this.log('new location is ' + this.getCurrentUrl(), 'info');
