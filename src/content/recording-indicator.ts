class RecordingIndicator {
    private element: HTMLDivElement | null = null;

    show() {
        if(this.element) return;
        this.element = document.createElement('div');
        this.element.id = 'meetia-recording-indicator';
        this.element.innerHTML = `<div style="
        position: fixed;
        bottom: 80px;
        right: 20px;
        z-index: 10;
        background: red;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items:center;
        gap: 10px;
        transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        <span style="width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        animation: pulse 2s infinite;">
        </span>
        <span>A Meet.ia está gravando sua reunião</span>
        </div>
        <style>@keyframes pulse {0%, 100% { opacity: 1; } 50% { opacity: 0.5; }}</style>`;
        document.body.appendChild(this.element);
        this.element.addEventListener('click', ()=> {
            chrome.runtime.sendMessage({type: 'OPEN_POPUP'});
        });
    }

    hide() {
        if(this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}

export const recordingIndicator = new RecordingIndicator();