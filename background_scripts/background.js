// let inertiaData = null
let port = null

let isNotInertia = false

// The connections is established when the panel is opened
browser.runtime.onConnect.addListener(p => {
    if (p.name === 'panel-connector') {
        port = p

        console.log('port connected')
        
        if(isNotInertia) {            
            port.postMessage({
                type: 'no-data',
            })

            return
        }

        // if( inertiaData ) {            
        //     sendDataToPanel(inertiaData, 'main-frame')
        // }

        port.onDisconnect.addListener(() => {
            port = null
        })
    } 
})

// main-frame
// partial-reload
// no-data
function sendDataToPanel(data, msg) {    
    if(!port) {
        return
    }

    port.postMessage({
        type: msg,
        payload: data,
    })
}

function listener(details) {
    const isMainFrame = details.type === 'main_frame'
    const isInertia = details.requestHeaders.find( h => h.name.toLowerCase() === 'x-inertia')?.value === 'true'
    const isPartial = !!details.requestHeaders.find( h => h.name.toLowerCase() === 'x-inertia-partial-data')

    if( !(isMainFrame || isInertia || isPartial)) {
        return 
    }

    const filter = browser.webRequest.filterResponseData(details.requestId)
    const decoder = new TextDecoder('utf-8')
    let data = ''
    
    filter.ondata = (event) => {
        data += decoder.decode(event.data, { stream: true })
        filter.write(event.data) // Continue passing data to the browser
    }

    filter.onstop = (event) => {
        if(isMainFrame) {
            sendDataToPanel(readMainFrame(data), 'main-frame')
        } else if (isPartial) {
            sendDataToPanel(readPartial(data), 'partial-reload')
        } else {
            sendDataToPanel(data, 'main-frame')
        }
        
        filter.disconnect()
    }
}

browser.webRequest.onBeforeSendHeaders.addListener(
    listener,
    { 
        urls: ['<all_urls>'],
        types: ['main_frame', 'xmlhttprequest', 'fetch'], 
    },
    ['blocking', 'requestHeaders'],
)

function readPartial(data) {
    console.log('🚀 Reading partial update')

    return data
}

function readMainFrame(html) {
    console.log('🚀 Reading main frame')
    
    // Look for the Inertia page data in the HTML
    const match = html.match(/<div[^>]+id="app"[^>]+data-page="([^"]+)"/)
    
    if (match) {
        try {
            return match[1]
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&')
                .replace(/&#39;/g, '\'')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
        } catch (error) {
            console.error('Failed to parse Inertia page data:', error)
        }
    } else {
        console.log('Inertia data not found.')

        isNotInertia = true
    }
}
