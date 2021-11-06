
declare var window: any;
export function ProcessClose() {
    if (!window.mainClose) {
        return;
    }
    window.mainClose();
}