module.exports.xtraParseQuoted = (args) => {
    let newArgs = []
    let bufferPos;
    let buffer;
    //console.log(`Old Args: ${JSON.stringify(args, null, 2)}`)
    for (let i = 0; i < args.length; i++) {
        const current = args[i]
        //console.log(`\nCurrent: ${current}`)
        if (current.search('"') > -1 && current.search('"') < 2 ) {
            bufferPos = i
            buffer = current.replace('"', "")
            //console.log(`BUF_REP: ${buffer}`)
        } else if (current.search('"') > -1 && current.search('"') > 2){
            buffer += ` ${current.replace('"', '')}`
            //console.log(buffer)
            newArgs[newArgs.length - 1 < bufferPos ? newArgs.length : bufferPos] = buffer
            //console.log(`STR_END: ${newArgs[bufferPos]}`)
            buffer = undefined
        } else if (!buffer) {
            newArgs.push(current)
            //console.log(`NOT_STR: ${newArgs[newArgs.length - 1]}`)
        } else {
            buffer += ` ${current.replace('"', '')}`
        }
        //console.log(`Buffer: ${buffer}`)
        //console.log(`ITR: ${i}`)
        //console.log(`AAP: ${newArgs[bufferPos]}`)
        //console.log(`AA: ${newArgs}`)
    }
    if (buffer) {
        newArgs.push(buffer.replace('"', ''))
        buffer == undefined
    }
    // newArgs.filter(x => x == null)
    //console.log(`\nNew Args: ${JSON.stringify(newArgs, null, 2)}`)
    return newArgs
    
    // End formatting
}

// DEFAULT
module.exports.xtraParse = (args) => {
    let buffer;
    let bufferPos;
    let newArgs = []

    for (var i = 0; i < args.length; i++) {
        const current = args[i]
        // This is a flag
        if (current.search("-") > -1 && current.search("-") < 1) {
            //console.log(`Setting flag ${current} to pos ${i}`)
            if (buffer) {
                //console.log(`Setting "${buffer}" To position ${bufferPos}`)
                newArgs[bufferPos] = buffer
                buffer = undefined
            }
            newArgs[i] = current
        } else if (buffer) {
            //console.log(`Adding ${current} to buffer`)
            buffer += ` ${current}`
        } else if (!buffer) {
            //console.log(`Assigning buffer to ${current} with position of ${i}`)
            bufferPos = i
            buffer = current
        }
    }
    // Here we clean up
    if (buffer) {
        newArgs.push(buffer)
        buffer = undefined
    }
    newArgs = newArgs.filter((a) => a !== undefined).map((a) => a.split(' ').map((i) => i.replace(/"/, '')).join(' '))
    return newArgs
}