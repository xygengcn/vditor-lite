import { Constants } from "../constants"
import { setEditMode } from "../util/EditMode"
import { accessLocalStorage } from "../util/compatibility"
import { setContentTheme } from "./setContentTheme"
import { setTheme } from "./setTheme"

export const initUI = (vditor: IVditor) => {
    vditor.element.innerHTML = ""
    vditor.element.classList.add("vditor")
    // 支持 RTL
    if (vditor.options.rtl) {
        vditor.element.setAttribute("dir", "rtl")
    }
    setTheme(vditor)
    setContentTheme(
        vditor.options.preview.theme.current,
        vditor.options.preview.theme.path
    )
    if (typeof vditor.options.height === "number") {
        vditor.element.style.height = vditor.options.height + "px"
    } else {
        vditor.element.style.height = vditor.options.height
    }
    if (typeof vditor.options.minHeight === "number") {
        vditor.element.style.minHeight = vditor.options.minHeight + "px"
    }
    if (typeof vditor.options.width === "number") {
        vditor.element.style.width = vditor.options.width + "px"
    } else {
        vditor.element.style.width = vditor.options.width
    }

    const contentElement = document.createElement("div")
    contentElement.className = "vditor-content"

    if (vditor.options.outline.position === "left") {
        contentElement.appendChild(vditor.outline.element)
    }

    contentElement.appendChild(vditor.ir.element.parentElement)

    contentElement.appendChild(vditor.preview.element)

    //
    // contentElement.appendChild(vditor.devtools.element)
    //

    if (vditor.options.outline.position === "right") {
        vditor.outline.element.classList.add("vditor-outline--right")
        contentElement.appendChild(vditor.outline.element)
    }

    if (vditor.upload) {
        contentElement.appendChild(vditor.upload.element)
    }

    if (vditor.options.resize.enable) {
        contentElement.appendChild(vditor.resize.element)
    }

    contentElement.appendChild(vditor.hint.element)

    contentElement.appendChild(vditor.tip.element)

    vditor.element.appendChild(contentElement)

    // pdf 输出
    // vditor.element.insertAdjacentHTML(
    //     "beforeend",
    //     '<iframe id="vditorExportIframe" style="width: 100%;height: 0;border: 0"></iframe>'
    // )

    setEditMode(vditor, vditor.options.mode, afterRender(vditor))

    document.execCommand("DefaultParagraphSeparator", false, "p")

    if (
        navigator.userAgent.indexOf("iPhone") > -1 &&
        typeof window.visualViewport !== "undefined"
    ) {
        // https://github.com/Vanessa219/vditor/issues/379
        let pendingUpdate = false
        const viewportHandler = () => {
            if (pendingUpdate) {
                return
            }
            pendingUpdate = true

            requestAnimationFrame(() => {
                pendingUpdate = false
            })
        }
        window.visualViewport.addEventListener("scroll", viewportHandler)
        window.visualViewport.addEventListener("resize", viewportHandler)
    }
}

export const setPadding = (vditor: IVditor) => {
    const minPadding = window.innerWidth <= Constants.MOBILE_WIDTH ? 10 : 35

    if (vditor.ir.element.parentElement.style.display !== "none") {
        const padding =
            (vditor.ir.element.parentElement.clientWidth -
                vditor.options.preview.maxWidth) /
            2
        vditor.ir.element.style.padding = `10px ${Math.max(
            minPadding,
            padding
        )}px`
    }
}

export const setTypewriterPosition = (vditor: IVditor) => {
    if (!vditor.options.typewriterMode) {
        return
    }
    let height: number = window.innerHeight
    if (typeof vditor.options.height === "number") {
        height = vditor.options.height
        if (typeof vditor.options.minHeight === "number") {
            height = Math.max(height, vditor.options.minHeight)
        }
        height = Math.min(window.innerHeight, height)
    } else {
        height = vditor.element.clientHeight
    }
    if (vditor.element.classList.contains("vditor--fullscreen")) {
        height = window.innerHeight
    }
    // 由于 Firefox padding-bottom bug，只能使用 :after
    vditor.ir.element.style.setProperty("--editor-bottom", height / 2 + "px")
}

let resizeCb: () => void

export function UIUnbindListener() {
    window.removeEventListener("resize", resizeCb)
}

const afterRender = (vditor: IVditor) => {
    setTypewriterPosition(vditor)
    UIUnbindListener()
    window.addEventListener(
        "resize",
        (resizeCb = () => {
            setPadding(vditor)
            setTypewriterPosition(vditor)
        })
    )

    // set default value
    let initValue =
        accessLocalStorage() && localStorage.getItem(vditor.options.cache.id)
    if (!vditor.options.cache.enable || !initValue) {
        if (vditor.options.value) {
            initValue = vditor.options.value
        } else if (vditor.originalInnerHTML) {
            initValue = vditor.lute.HTML2Md(vditor.originalInnerHTML)
        } else if (!vditor.options.cache.enable) {
            initValue = ""
        }
    }
    return initValue || ""
}
