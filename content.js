
/**
 * When inerita is first loaded the data it added to the data-page in div app="id"
 * Every subsequent page visit is an xmr request with the ['Vary': 'X-Inertia', 'X-Inertia': true ] headers.
 */

// when the extension is first loaded, get the page-props from the app div
function getPageData(app){
    try {
        const pageData = JSON.parse(app.getAttribute('data-page'))
            
        return pageData
    } catch (error) {
        console.error('Error parsing Inertia props:', error)
    }
}

function getApp() {
    const app = document.querySelector('#app')

    if(!app) {
        throw new Error('<div id="app"> not found. Possibly not an inertia page.')
    }
    
    return app
}

// send props to background.js
function sendMessage(data){
    browser.runtime.sendMessage({
        type: 'initial-load',
        payload: data,
    })
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        const app = getApp()
        const data = getPageData(app)
        
        sendMessage(data)
    } catch (error) {
        console.error(error)
    }
})

