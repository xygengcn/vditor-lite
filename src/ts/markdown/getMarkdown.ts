export const getMarkdown = (vditor: IVditor) => {
    if (vditor.currentMode === "ir") {
        return vditor.lute.VditorIRDOM2Md(vditor.ir.element.innerHTML)
    }
    return ""
}
