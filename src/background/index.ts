import { MessageType } from '../constants/messages';

chrome.runtime.onInstalled.addListener(() => {
    console.log('Meet.ia extension installed');
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if(message.type === MessageType.NEW_CAPTION)
        console.debug('New caption captured:', message.data);
    

    if(message.type === MessageType.OPEN_POPUP) {
        chrome.action.openPopup()
            .then(() => sendResponse({success: true}))
            .catch(() => sendResponse({success: false}));
        return true;
    }

    return true;
});
