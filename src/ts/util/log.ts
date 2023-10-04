export const log = (
    method: string,
    content: string,
    type: string,
    print: boolean
) => {
    if (print) {
        console.log(`${method} - ${type}: ${content}`)
    }
}
