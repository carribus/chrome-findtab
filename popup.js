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

    var _onLinkClick = function(e) {
        var link = e.currentTarget;
        var tabID = parseInt(link.getAttribute('x-data-tabid'));

        chrome.tabs.get(tabID, function(tab) {
            chrome.tabs.update(tabID, { active: true }, function(tab) {
                chrome.windows.update(tab.windowId, {focused:true});
            });
        });
    }

    var _createResultDiv = function(tab) {
        var div, img, link;

        console.log(tab);

        div = document.createElement('div');
        div.classList.add('result');

        img = document.createElement('img');
        img.classList.add('favicon');
        img.src = tab.favIconUrl;

        link = document.createElement('a');
        link.innerHTML = tab.title;
        link.href="#";
        link.setAttribute('x-data-tabid', tab.id);
        link.addEventListener('click', _onLinkClick);

        div.appendChild(img);
        div.appendChild(link);

        return div;
    }

    var _addSearchResult = function(tab) {
        var results = document.getElementById('searchResults');
        var result;

        if ( results ) {
            result = _createResultDiv(tab);
            results.appendChild(result);
        }
    }

    var _renderResults = function(content, results) {
        var resultsArea = document.getElementById('searchResults');

        if ( results ) {
            // remove all children first
            while ( resultsArea.childNodes.length )   resultsArea.removeChild(resultsArea.childNodes[0]);

            for ( var i = 0, len = results.length; i < len; i++ ) {
                _addSearchResult(results[i]);
            }
        }
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
        _enumTabs(function(tabArray) {
            _filterTabsByContent(tabArray, content);
        });
    }

    return me;
})();

document.addEventListener('DOMContentLoaded', function () {
    var searchField = document.getElementById('searchFor');

    searchField.addEventListener('keyup', function(e) {
        FindTab.searchTabsFor(searchField.value);
    })
});
