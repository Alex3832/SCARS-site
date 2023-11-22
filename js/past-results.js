function retrieveCookies() {
    let cookies = document.cookie.split(';')

    let timestampArray = []
    let confidenceArray = []
    let predictionArray = []

    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim()
        let separatorIndex = cookie.indexOf('=')

        if (separatorIndex != -1) {
            let cookieName = cookie.substring(0, separatorIndex)
            let cookieValue = cookie.substring(separatorIndex + 1)
        
            try {
                let cookieData = JSON.parse(decodeURIComponent(cookieValue))

                if (cookieData.timestamp !== undefined) {
                    timestampArray.push(cookieData.timestamp)
                }

                if (cookieData.confidence !== undefined) {
                    confidenceArray.push(cookieData.confidence)
                }

                if (cookieData.prediction !== undefined) {
                    predictionArray.push(cookieData.prediction)
                }
            } catch (e) {
                console.error(e)
            }
        }
    }

    return {
        timestamp: timestampArray,
        confidence: confidenceArray,
        prediction: predictionArray
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const cookies = retrieveCookies()
    console.log(cookies)
})