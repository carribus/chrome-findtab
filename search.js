chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        console.log(document.title);
        if ( (document.title.toLowerCase().indexOf(message.searchText) != -1) ||
             (document.body.innerText.toLowerCase().indexOf(message.searchText) != -1) ) {
            message.found = true;
        } else {
            message.found = false;
        }
        sendResponse(message);
    }
);
