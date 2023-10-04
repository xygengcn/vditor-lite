export const getHTML = (vditor: IVditor) => {
    return vditor.lute.VditorIRDOM2HTML(vditor.ir.element.innerHTML)
}
