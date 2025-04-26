const propsContainer = document.getElementById('props-container')
const port = browser.runtime.connect({ name: 'panel-connector' })

let oldData = null
let inertiaData = null

let settingsLoaded = false

let initialDepth = 2

function onSettingsReceived(settings) {
    if(!settings ) {
        return
    }

    if(settings.backgroundColor) {
        document.documentElement.style.setProperty('--backgroundColor', settings.backgroundColor)
    }
    
    if(settings.keyColor) {
        document.documentElement.style.setProperty('--keyColor', settings.keyColor)
    }

    if(settings.valueColor) {
        document.documentElement.style.setProperty('--valueColor', settings.valueColor)
    }

    if(settings.initialDepth) {
        initialDepth = settings.initialDepth
    }

    settingsLoaded = true
    render()
}

browser.storage.sync.get().then(onSettingsReceived, console.error)


// add listener for inertia props
port.onMessage.addListener((message) => {
    if(message.type === 'inertia-props') {

        if(message.payload === oldData) {
            console.log('Identical, no render')

            return
        }

        oldData = message.payload
        inertiaData = JSON.parse(message.payload).props

        render()
    }
    else if(message.type === 'no-data') {    
        console.log('panel received "no-data"')
            
        oldData = null
        inertiaData = null

        propsContainer.innerText = 'Not an inertia page.'
    }
})

function render() {    
    if(!inertiaData || !settingsLoaded){ 
        return
    }    

    propsContainer.replaceChildren()

    propsContainer.append(h('div', 'row', ['{']))
    propsContainer.append(...parse(inertiaData, 1))
    propsContainer.append(h('div', 'row', ['}']))
}

function parse(obj, depth) {
    return Object.entries(obj).flatMap(([key, value]) => {
        const row = createRow(key, depth)

        const hasChildren = value !== null && (
            (Array.isArray(value) && value.length > 0) ||
            (typeof value === 'object' && Object.keys(value).length > 0)
        )

        if (!hasChildren) {
            row.append(asValue(value))

            return [row]
        }

        const { expandable, block } = asExpandable(value, depth + 1, depth < initialDepth)

        row.append(expandable)
        
        return [row, block]
    })
}

const h = (tag, classNames, children = []) => {
    const element = document.createElement(tag)

    if (classNames) {
        classNames.split(' ').forEach(className => element.classList.add(className))
    }

    if(isArray(children)) {
        children.forEach(child => element.append(child) )
    } else if(children) {
        element.append(children)
    } 

    return element
}

const createButton = (value, block, expanded) => {
    let open = expanded

    const before = h('span', '', (isArray(value) ? '[' : '{'))
    const after = h('span', '', (isArray(value) ? '],' : '},'))

    const btn = h('div', 'inline', [before, h('button', '', '...'), after])


    if(expanded) {
        after.style.display = 'none'
    }

    btn.onclick = (e) => {
        e.stopPropagation()

        const expand = () => {
            after.style.display = 'none'
            block.style.display = 'block'
        }
        const collapse = () => {
            after.style.display = 'inline'
            block.style.display = 'none'
        }

        open ? collapse() : expand()

        open = !open
    }

    return btn
}

const asValue = (value) => {    
    if (isArray(value))
        return h('div', 'pl inline', [h('span', 'value', ['[]']), ','])
        
    if (isObject(value))
        return h('div', 'pl inline', [h('span', 'value', ['{}']), ','])

    if(typeof value === 'string') {
        return h('span', 'pl string-value', ['"', value, '"'])
        // return h('span', 'pl', ['"', h('span', 'string-value', [value]), '"'])
    }
    
    if(typeof value === 'number') {
        return h('span', 'pl number-value', [value])
    }

    if(typeof value === 'boolean') {
        return h('span', 'pl boolean-value', [value])
    }

    if(value === null) {
        return h('span', 'pl null-value', [value])
    }

    return h('div', 'pl inline value', [value])
}


const asExpandable = (value, depth, expanded) => { 
    const block = h('div', 'block')

    // set initially visibility/expanded
    block.style.display = expanded ? 'block' : 'none'

    block.append(...parse(value, depth))
    block.appendChild(createClosing(value, depth, true))

    const expandable = h('div', 'pl', [createButton(value, block, expanded)])

    return { 
        expandable,
        block, 
    }
}

const createClosing = (value, depth, indent) => {
    const closing = h('span', 'closing', [
        isArray(value) ? '],' : '},',
    ])

    if(indent) {
        closing.style.paddingLeft = (depth * 1.5) - 1.5 + 'rem'
    }

    return closing
}

const isArray = (value) => value !== null && Array.isArray(value)
const isObject = (value) => value !== null && typeof value === 'object'

function createRow(key, depth) {
    const row = h('div', 'row flex', [
        h('div', 'key', [key]), 
        ': ',
    ])

    row.style.paddingLeft = 1.5 * depth + 'rem'

    return row
}
