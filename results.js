function updateHeader(searchText) {
    var title = document.getElementsByTagName('title')[0];
    var header = document.getElementById('header');
    if ( title ) {
        title.innerText = title.innerText.replace('{{searchText}}', searchText);
    }
    if ( header ) {
        header.innerText = header.innerText.replace('{{searchText}}', searchText);
    }
}

function onLinkClick(e) {
    var link = e.currentTarget;
    var tabID = parseInt(link.getAttribute('x-data-tabid'));

    chrome.tabs.get(tabID, function(tab) {
        console.log(tab);
        chrome.tabs.update(tabID, { active: true }, function(tab) {
            chrome.windows.update(tab.windowId, {focused:true});
        });
    });
}

function createResultDiv(tab) {
    var div, img, link;

    console.log(tab);

    div = document.createElement('div');
    div.classList.add('result');

    img = document.createElement('img');
    img.src = tab.favIconUrl;

    link = document.createElement('a');
    link.innerHTML = tab.title;
    link.href="#";
    link.setAttribute('x-data-tabid', tab.id);
    link.addEventListener('click', onLinkClick);

    div.appendChild(img);
    div.appendChild(link);

    return div;
}

function addSearchResult(tab) {
    var results = document.getElementById('results');
    var result;

    if ( results ) {
        result = createResultDiv(tab);
        results.appendChild(result);
    }
}

function renderSearchResults(searchText, tabArray) {
    updateHeader(searchText);
    if ( tabArray ) {
        for ( var i = 0, len = tabArray.length; i < len; i++ ) {
            addSearchResult(tabArray[i]);
        }
    } else {
        console.error('tabArray is null');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.runtime.onMessage.addListener(
        function (message, sender, sendResponse) {
            console.log(message);
            renderSearchResults(message.searchText, message.tabs)
        }
    );
});