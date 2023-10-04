import { processAfterRender } from "../ir/process"
import { getMarkdown } from "../markdown/getMarkdown"
import { mathRender } from "../markdown/mathRender"
import { setPadding, setTypewriterPosition } from "../ui/initUI"
import { processCodeRender } from "./processCode"
import { renderToc } from "./toc"

export const setEditMode = (
    vditor: IVditor,
    type: string,
    event: Event | string
) => {
    let markdownText
    if (typeof event !== "string") {
        event.preventDefault()
        markdownText = getMarkdown(vditor)
    } else {
        markdownText = event
    }
    if (vditor.currentMode === type && typeof event !== "string") {
        return
    }
    if (vditor.devtools) {
        vditor.devtools.renderEchart(vditor)
    }
    if (vditor.options.preview.mode === "both" && type === "sv") {
        vditor.preview.element.style.display = "block"
    } else {
        vditor.preview.element.style.display = "none"
    }

    vditor.ir.element.parentElement.style.display = "block"

    vditor.lute.SetVditorIR(true)
    vditor.lute.SetVditorWYSIWYG(false)
    vditor.lute.SetVditorSV(false)

    vditor.currentMode = "ir"
    vditor.ir.element.innerHTML = vditor.lute.Md2VditorIRDOM(markdownText)
    processAfterRender(vditor, {
        enableAddUndoStack: true,
        enableHint: false,
        enableInput: false,
    })

    setPadding(vditor)

    vditor.ir.element
        .querySelectorAll(".vditor-ir__preview[data-render='2']")
        .forEach((item: HTMLElement) => {
            processCodeRender(item, vditor)
        })
    vditor.ir.element
        .querySelectorAll(".vditor-toc")
        .forEach((item: HTMLElement) => {
            mathRender(item, {
                cdn: vditor.options.cdn,
                math: vditor.options.preview.math,
            })
        })

    vditor.undo.clearStack()
    if (typeof event !== "string") {
        // 初始化不 focus
        vditor[vditor.currentMode].element.focus()
    }
    renderToc(vditor)
    setTypewriterPosition(vditor)

    vditor.outline.toggle(
        vditor,
        vditor.options.outline.enable,
        typeof event !== "string"
    )
}
