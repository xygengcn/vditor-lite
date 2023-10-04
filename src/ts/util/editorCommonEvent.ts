import { Constants } from "../constants"
import { processHeading } from "../ir/process"
import { processKeydown as irProcessKeydown } from "../ir/processKeydown"
import { getMarkdown } from "../markdown/getMarkdown"
import { previewImage } from "../preview/image"
import { isCtrl } from "./compatibility"
import { execAfterRender, paste } from "./fixBrowserBehavior"
import { getSelectText } from "./getSelectText"
import { matchHotKey } from "./hotKey"
import { getCursorPosition, getEditorRange } from "./selection"

export const focusEvent = (vditor: IVditor, editorElement: HTMLElement) => {
    editorElement.addEventListener("focus", () => {
        if (vditor.options.focus) {
            vditor.options.focus(getMarkdown(vditor))
        }
    })
}

export const dblclickEvent = (vditor: IVditor, editorElement: HTMLElement) => {
    editorElement.addEventListener(
        "dblclick",
        (event: MouseEvent & { target: HTMLElement }) => {
            if (event.target.tagName === "IMG") {
                if (vditor.options.image.preview) {
                    vditor.options.image.preview(event.target)
                } else if (vditor.options.image.isPreview) {
                    previewImage(
                        event.target as HTMLImageElement,
                        vditor.options.lang,
                        vditor.options.theme
                    )
                }
            }
        }
    )
}

export const blurEvent = (vditor: IVditor, editorElement: HTMLElement) => {
    editorElement.addEventListener("blur", () => {
        const expandElement = vditor.ir.element.querySelector(
            ".vditor-ir__node--expand"
        )
        if (expandElement) {
            expandElement.classList.remove("vditor-ir__node--expand")
        }
        vditor.ir.range = getEditorRange(vditor)
        if (vditor.options.blur) {
            vditor.options.blur(getMarkdown(vditor))
        }
    })
}

export const dropEvent = (vditor: IVditor, editorElement: HTMLElement) => {
    editorElement.addEventListener("dragstart", (event) => {
        // 选中编辑器中的文字进行拖拽
        event.dataTransfer.setData(Constants.DROP_EDITOR, Constants.DROP_EDITOR)
    })
    editorElement.addEventListener(
        "drop",
        (
            event: ClipboardEvent & {
                dataTransfer?: DataTransfer
                target: HTMLElement
            }
        ) => {
            if (event.dataTransfer.getData(Constants.DROP_EDITOR)) {
                // 编辑器内选中文字拖拽
                execAfterRender(vditor)
            } else if (
                event.dataTransfer.types.includes("Files") ||
                event.dataTransfer.types.includes("text/html")
            ) {
                // 外部文件拖入编辑器中或者编辑器内选中文字拖拽
                paste(vditor, event, {
                    pasteCode: (code: string) => {
                        document.execCommand("insertHTML", false, code)
                    },
                })
            }
        }
    )
}

export const copyEvent = (
    vditor: IVditor,
    editorElement: HTMLElement,
    copy: (event: ClipboardEvent, vditor: IVditor) => void
) => {
    editorElement.addEventListener("copy", (event: ClipboardEvent) =>
        copy(event, vditor)
    )
}

export const cutEvent = (
    vditor: IVditor,
    editorElement: HTMLElement,
    copy: (event: ClipboardEvent, vditor: IVditor) => void
) => {
    editorElement.addEventListener("cut", (event: ClipboardEvent) => {
        copy(event, vditor)

        document.execCommand("delete")
    })
}

export const scrollCenter = (vditor: IVditor) => {
    if (!vditor.options.typewriterMode) {
        return
    }
    const editorElement = vditor[vditor.currentMode].element
    const cursorTop = getCursorPosition(editorElement).top
    if (
        vditor.options.height === "auto" &&
        !vditor.element.classList.contains("vditor--fullscreen")
    ) {
        window.scrollTo(
            window.scrollX,
            cursorTop + vditor.element.offsetTop - window.innerHeight / 2 + 10
        )
    }
    if (
        vditor.options.height !== "auto" ||
        vditor.element.classList.contains("vditor--fullscreen")
    ) {
        editorElement.scrollTop =
            cursorTop +
            editorElement.scrollTop -
            editorElement.clientHeight / 2 +
            10
    }
}

export const hotkeyEvent = (vditor: IVditor, editorElement: HTMLElement) => {
    editorElement.addEventListener(
        "keydown",
        (event: KeyboardEvent & { target: HTMLElement }) => {
            if (!event.isComposing && vditor.options.keydown) {
                vditor.options.keydown(event)
            }
            // hint: 上下选择
            if (
                vditor.options.hint.extend.length > 1 &&
                vditor.hint.select(event, vditor)
            ) {
                return
            }

            if (irProcessKeydown(vditor, event)) {
                return
            }

            if (vditor.options.ctrlEnter && matchHotKey("⌘Enter", event)) {
                vditor.options.ctrlEnter(getMarkdown(vditor))
                event.preventDefault()
                return
            }

            // undo
            if (matchHotKey("⌘Z", event)) {
                vditor.undo.undo(vditor)
                event.preventDefault()
                return
            }

            // redo
            if (matchHotKey("⌘Y", event)) {
                vditor.undo.redo(vditor)
                event.preventDefault()
                return
            }

            // esc
            if (event.key === "Escape") {
                if (vditor.hint.element.style.display === "block") {
                    vditor.hint.element.style.display = "none"
                } else if (vditor.options.esc && !event.isComposing) {
                    vditor.options.esc(getMarkdown(vditor))
                }
                event.preventDefault()
                return
            }

            // h1 - h6 hotkey
            if (
                isCtrl(event) &&
                event.altKey &&
                !event.shiftKey &&
                /^Digit[1-6]$/.test(event.code)
            ) {
                processHeading(
                    vditor,
                    "#".repeat(parseInt(event.code.replace("Digit", ""), 10)) +
                        " "
                )
                event.preventDefault()
                return true
            }
        }
    )
}

export const selectEvent = (vditor: IVditor, editorElement: HTMLElement) => {
    editorElement.addEventListener("selectstart", () => {
        editorElement.onmouseup = () => {
            setTimeout(() => {
                // 鼠标放开后 range 没有即时更新
                const selectText = getSelectText(
                    vditor[vditor.currentMode].element
                )
                if (selectText.trim()) {
                    if (vditor.options.select) {
                        vditor.options.select(selectText)
                    }
                }
            })
        }
    })
}
