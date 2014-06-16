var FindTab = (function() {
    var me = {};
    var _enumTabs = function(callback) {
        var resultArray = [];
        var queryObj = {
            currentWindow: true,
            status: 'complete'
        };

        chrome.tabs.query(queryObj, function(tabArray) {
            queryObj.currentWindow = false;
            resultArray = tabArray;
            chrome.tabs.query(queryObj, function(tabArray) {
                resultArray = resultArray.concat(tabArray);
                callback(resultArray);
            })
        });

    }

    var _renderResults = function(content, results) {
        var targetUrl = chrome.extension.getURL('/') + 'results.html?content=' + encodeURIComponent(content);
        chrome.tabs.create({active:true, url:targetUrl}, function(tab) {
            chrome.tabs.executeScript(tab.id, {file:'results.js'}, function() {
                chrome.tabs.sendMessage(tab.id, {searchText: content, tabs:results});
            })
        })
    }

    var _filterTabsByContent = function(tabs, searchText) {
        var result = [];
        var tab;

        content = searchText.toLowerCase();
        for ( var i = tabs.length-1; i >= 0; i-- ) {
            tab = tabs[i];
            tab.lastTab = (i==0);

            chrome.tabs.executeScript(tab.id, {file: 'search.js'}, function() {
                var tabID = this.id;
                chrome.tabs.sendMessage(tabID, {"tab": this, method:'search', searchText:content, lastTab: this.lastTab}, function(response){
                    if ( response ) {
                        if ( response.found ) {
                            result.push(response.tab);
                        }

                        if ( response.lastTab) {
                            _renderResults(searchText, result);
                        }
                    }
                })
            }.bind(tab));
        }
    }

    me.searchTabsFor = function(content) {
        console.log('searching for: %s', content);

        _enumTabs(function(tabArray) {
            _filterTabsByContent(tabArray, content);
        });
    }

    return me;
})();

document.addEventListener('DOMContentLoaded', function () {
    var searchField = document.getElementById('searchFor');
    var searchBtn = document.getElementById('searchButton') ;

    searchBtn.addEventListener('click', function(e) {
        console.log('Search clicked');
        FindTab.searchTabsFor(searchField.value);
    })

    searchField.addEventListener('keydown', function(e) {
        if (e.keyCode == 13 ) {
            searchBtn.click();
        }
    })
});
