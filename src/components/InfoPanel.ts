export function createInfoPanel(id: string, content: string): HTMLDivElement {
    const elem = document.getElementById("info-panel")
    if (elem) {
        document.body.removeChild(elem)
    }
    const panel = document.createElement("div")
    panel.id = "info-panel"
    panel.className = "info-panel"
    panel.textContent = content
    return panel
}