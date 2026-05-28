export const MessageType = {
    NEW_CAPTION: 'NEW_CAPTION',
    START_RECORDING: 'START_RECORDING',
    STOP_RECORDING: 'STOP_RECORDING',
    OPEN_POPUP: 'OPEN_POPUP',
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];
