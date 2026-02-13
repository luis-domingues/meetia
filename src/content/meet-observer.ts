import { recordingIndicator } from "./recording-indicator";

interface CaptionData {
    speaker: string;
    text: string;
    timestamp: number;
}

class MeetTranscriptCapture {
    private captions: CaptionData[] = [];
    private observer: MutationObserver | null = null;
    private isRecording = false;

    start() {
        this.isRecording = true;
        console.log("started recording captions");
        recordingIndicator.show();
        this.observer = new MutationObserver(()=> {this.captureVisibleCaptions()});
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.captureVisibleCaptions();
    }

    private captureVisibleCaptions() {
        if(!this.isRecording) return;
        const captionElements = document.querySelectorAll('[jsname="YSxPC"], .a4cQT, [class*="caption"]');

        captionElements.forEach((element)=> {
            const text = element.textContent?.trim();
            if(!text) return;

            const lastCaption = this.captions[this.captions.length - 1];
            if(lastCaption?.text === text) return;
            this.captions.push({
                speaker: this.extractSpeaker(element),
                text,
                timestamp: Date.now(),
            });

            chrome.runtime.sendMessage({
                type: 'NEW_CAPTION',
                data: {text, timestamp: Date.now()}
            }).catch(error=> {console.debug('Background not listening for NEW_CAPTION', error)});
        });
    }

    private extractSpeaker(element: Element): string {
        //identify speaker from element
        const speakerElement = element.parentElement?.querySelector('[class*="name"]');
        return speakerElement?.textContent?.trim() || 'Unknown';
    }

    stop() {
        this.isRecording = false;
        this.observer?.disconnect();
        recordingIndicator.hide();
        return this.captions;
    }

    getTranscript(): string {
        return this.captions.map(c => `[${new Date(c.timestamp).toLocaleDateString()}] ${c.speaker}: ${c.text}`).join('\n');
    }
}

if(window.location.hostname === 'meet.google.com') {
    const capture = new MeetTranscriptCapture();
    chrome.runtime.onMessage.addListener((message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void)=> {
        if(message.type === 'START_RECORDING') {
            capture.start();
            sendResponse({success: true});
        } else if(message.type === 'STOP_RECORDING') {
            capture.stop();
            sendResponse({transcript: capture.getTranscript()});
        }
        return true;
    });
}