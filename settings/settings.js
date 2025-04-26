
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
        key: 'backgroundColor',
        model: model('#backgroundColor'),
        default: '#444444',
        get value() {
            return this.model.value
        },
        set value(val) {
            this.model.value = val
        },
    },
    {
        key: 'keyColor',
        model: model('#keyColor'),
        default: '#32CD32',
        get value() {
            return this.model.value
        },
        set value(val) {
            this.model.value = val
        },
    },
    {
        key: 'valueColor',
        model: model('#valueColor'),
        default: '#FFD700',
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


  