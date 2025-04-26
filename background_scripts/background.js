let inertiaData = null
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

        if( inertiaData ) {            
            sendDataToPanel()
        }

        port.onDisconnect.addListener(() => {
            port = null
        })
    } 
})

function sendDataToPanel() {    
    if(!port) {
        return
    }

    port.postMessage({
        type: 'inertia-props',
        payload: inertiaData,
    })
}

browser.webRequest.onBeforeSendHeaders.addListener(
    function (details) {        
        const filter = browser.webRequest.filterResponseData(details.requestId)
        const decoder = new TextDecoder('utf-8')
        let data = ''
        
        const isMainFrame = details.type === 'main_frame'
        const isInertia = details.requestHeaders.find(
            h => h.name.toLowerCase() === 'x-inertia',
        )?.value === 'true'        
  
        filter.ondata = (event) => {
            data += decoder.decode(event.data, { stream: true })
            filter.write(event.data) // Continue passing data to the browser
        }
  
        filter.onstop = (event) => {
            if( isMainFrame ) {
                inertiaData = readMainFrame(data)
            }
            else if(isInertia) {
                inertiaData = readPartial(data)
            }

            if(inertiaData) {
                sendDataToPanel()
            } else {
                console.error('No data')
            }

            filter.disconnect()
        }
  
        return {}
    },
    { 
        urls: ['<all_urls>'],
        types: ['main_frame', 'xmlhttprequest', 'fetch'], 
    },
    ['blocking', 'requestHeaders'],
)

function readPartial(data) {
    console.log('🚀 Reading inertia update')

    return data
}

function readMainFrame(html) {
    console.log('🚀 Reading main frame')
    
    // Look for the Inertia page data in the HTML
    const match = html.match(/<div[^>]+id="app"[^>]+data-page="([^"]+)"/)
    
    if (match) {
        const data = match[1]
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&#39;/g, '\'')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
        
        try {
            return data
        } catch (error) {
            console.error('Failed to parse Inertia page data:', error)
        }
    } else {
        console.log('Inertia data not found.')

        isNotInertia = true
    }
}
