import { MessageType } from '../constants/messages';

class RecordingIndicator {
    private element: HTMLDivElement | null = null;

    show() {
        if(this.element) return;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes meetia-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.4; }
            }
            #meetia-recording-indicator .meetia-pulse {
                animation: meetia-pulse 2s infinite;
            }
            #meetia-recording-indicator .meetia-container:hover {
                transform: scale(1.05);
            }
        `;

        const dot = document.createElement('span');
        dot.className = 'meetia-pulse';
        Object.assign(dot.style, {
            width: '8px',
            height: '8px',
            background: 'white',
            borderRadius: '50%',
            flexShrink: '0',
            display: 'inline-block',
        });

        const label = document.createElement('span');
        label.textContent = 'A Meet.ia está gravando sua reunião';

        const container = document.createElement('div');
        container.className = 'meetia-container';
        Object.assign(container.style, {
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            zIndex: '999999',
            background: '#cc0000',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '6px',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            userSelect: 'none',
        });
        container.appendChild(dot);
        container.appendChild(label);
        container.addEventListener('click', () => {
            chrome.runtime.sendMessage({ type: MessageType.OPEN_POPUP });
        });

        this.element = document.createElement('div');
        this.element.id = 'meetia-recording-indicator';
        this.element.appendChild(style);
        this.element.appendChild(container);
        document.body.appendChild(this.element);
    }

    hide() {
        this.element?.remove();
        this.element = null;
    }
}

export const recordingIndicator = new RecordingIndicator();
