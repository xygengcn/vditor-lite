import { Constants } from "../constants"
import { outlineRender } from "../markdown/outlineRender"
import { setPadding } from "../ui/initUI"
import { setSelectionFocus } from "../util/selection"

export class Outline {
    public element: HTMLElement

    constructor(outlineLabel: string) {
        this.element = document.createElement("div")
        this.element.className = "vditor-outline"
        this.element.innerHTML = `<div class="vditor-outline__title">${outlineLabel}</div>
<div class="vditor-outline__content"></div>`
    }

    public render(vditor: IVditor) {
        let html = ""
        if (vditor.preview.element.style.display === "block") {
            html = outlineRender(
                vditor.preview.previewElement,
                this.element.lastElementChild,
                vditor
            )
        } else {
            html = outlineRender(
                vditor.ir.element,
                this.element.lastElementChild,
                vditor
            )
        }
        return html
    }

    public toggle(vditor: IVditor, show = true, focus = true) {
        if (show && window.innerWidth >= Constants.MOBILE_WIDTH) {
            this.element.style.display = "block"
            this.render(vditor)
        } else {
            this.element.style.display = "none"
        }
        if (focus && getSelection().rangeCount > 0) {
            const range = getSelection().getRangeAt(0)
            if (vditor.ir.element.contains(range.startContainer)) {
                setSelectionFocus(range)
            }
        }
        setPadding(vditor)
    }
}
