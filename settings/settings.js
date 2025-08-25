
const model = (identifier) => {
    const el = document.querySelector(identifier)

    if(! el) {
        throw new Error(`element with identifier '${identifier}' not found`)
    }

    el.addEventListener('input', () => {        
        return el.value
    })

    return {
        get value() {
            return el.value
        },
        set value(val){           
            el.value = val
        },
    }
}
const settings = [
    {
        key: 'theme',
        model: model('#theme'),
        default: 'dark',
        get value() {
            return this.model.value
        },
        set value(val) {
            this.model.value = val
        },
    },
    {
        key: 'initialDepth',
        model: model('#initialDepth'),
        default: 2,
        get value() {
            return this.model.value
        },
        set value(val) {
            this.model.value = val
        },
    },
]


function onSaved(e) {
    e.preventDefault()
    
    const syncSettings = settings.reduce((obj, curr) => {        
        obj[curr.key] = curr.value

        return obj
    }, {})    

    browser.storage.sync.set(syncSettings)
}

function getStoredSettings() {
    settings.forEach(setting => {
        browser.storage.sync.get(setting.key)
            .then(result => {
                setting.value = result[setting.key] || setting.default
            }, console.error)
    })
}

document.querySelector('form')
    .addEventListener('submit', onSaved)

document.addEventListener('DOMContentLoaded', getStoredSettings)


  