chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        console.log('searching for: %s', message.searchText);
        if ( document.body.innerText.indexOf(message.searchText) != -1 ) {
            console.log('Found %s in text', message.searchText);
            message.found = true;
        } else {
            message.found = false;
        }
        sendResponse(message);
    }
);
