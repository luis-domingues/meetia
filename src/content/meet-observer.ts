import { type CaptionData } from '../types';
import { MessageType } from '../constants/messages';
import { recordingIndicator } from './recording-indicator';

interface StartRecordingMessage { type: typeof MessageType.START_RECORDING }
interface StopRecordingMessage { type: typeof MessageType.STOP_RECORDING }
type IncomingMessage = StartRecordingMessage | StopRecordingMessage;

class MeetTranscriptCapture {
    private captions: CaptionData[] = [];
    private observer: MutationObserver | null = null;
    private isRecording = false;
    private captureScheduled = false;

    start() {
        this.isRecording = true;
        this.captions = [];
        recordingIndicator.show();

        this.observer = new MutationObserver(() => {
            if(this.captureScheduled) return;
            this.captureScheduled = true;
            requestAnimationFrame(() => {
                this.captureVisibleCaptions();
                this.captureScheduled = false;
            });
        });

        this.observer.observe(document.body, { childList: true, subtree: true });
        this.captureVisibleCaptions();
    }

    private captureVisibleCaptions() {
        if(!this.isRecording) return;
        const captionElements = document.querySelectorAll('[jsname="YSxPC"]:not([aria-hidden="true"])');

        captionElements.forEach((element) => {
            const text = element.textContent?.trim();
            if (!text || text.length > 500) return;
            if (text.includes('BETA') || text.includes('language')) return;

            const speaker = this.extractSpeaker(element);
            const lastCaption = this.captions[this.captions.length - 1];

            //if same speaker is still talking, update in-place instead of duplicating partial captions
            if(lastCaption?.speaker === speaker && text.startsWith(lastCaption.text)) {
                this.captions[this.captions.length - 1] = { ...lastCaption, text };
                return;
            }

            if(lastCaption?.text === text && lastCaption?.speaker === speaker) return;

            const now = Date.now();
            this.captions.push({speaker, text, timestamp: now});

            chrome.runtime.sendMessage({type: MessageType.NEW_CAPTION, data: {text, timestamp: now}}).catch(() => {});
        });
    }

    private extractSpeaker(element: Element): string {
        const speakerElement = element.parentElement?.querySelector('[class*="name"]');
        return speakerElement?.textContent?.trim() ?? 'Unknown';
    }

    stop() {
        this.isRecording = false;
        this.observer?.disconnect();
        this.observer = null;
        recordingIndicator.hide();
    }

    getTranscript(): string {
        return this.captions
            .map(c => `[${new Date(c.timestamp).toLocaleTimeString()}] ${c.speaker}: ${c.text}`)
            .join('\n');
    }
}

if(window.location.hostname === 'meet.google.com') {
    const capture = new MeetTranscriptCapture();

    chrome.runtime.onMessage.addListener((
        message: IncomingMessage,
        _sender: chrome.runtime.MessageSender,
        sendResponse: (response: unknown) => void,
    ) => {
        if(message.type === MessageType.START_RECORDING) {
            capture.start();
            sendResponse({ success: true });
        } else if(message.type === MessageType.STOP_RECORDING) {
            capture.stop();
            sendResponse({ transcript: capture.getTranscript() });
        }
        return true;
    });
}