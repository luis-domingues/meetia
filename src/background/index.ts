console.log("background script running");

chrome.runtime.onInstalled.addListener(()=> {
    console.log("Extension installed");
});

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if(message.type === 'NEW_CAPTION') console.log('New caption captured:', message.data);
    return true;
})