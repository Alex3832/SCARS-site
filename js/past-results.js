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
        timestamps: timestampArray,
        confidences: confidenceArray,
        predictions: predictionArray
    }
}

// helper function
function convertTimestampToDate(timestamp) {
    return new Date(timestamp).toLocaleString()
}

document.addEventListener("DOMContentLoaded", function() {
    const cookies = retrieveCookies()

    // create scatter chart
    // x axis: timestamp
    // y axis: predictions
    // size: confidence
    let scatterData = {
        labels: cookies.predictions,
        datasets: [{
            label: 'Predictions',
            data: cookies.predictions.map((prediction, index) => ({
                x: cookies.timestamps[index],
                y: prediction
            })),
            borderColor: cookies.predictions.map(prediction => prediction === 'Malignant' ? 'rgba(255, 175, 175, 1)' : 'rgba(175, 175, 255, 1)'),
            borderWidth: 1,
            backgroundColor: cookies.predictions.map(prediction => prediction === 'Malignant' ? 'rgba(255, 175, 175, 0.5)' : 'rgba(175, 175, 255, 0.5)'),
            hoverBackgroundColor: cookies.predictions.map(prediction => prediction === 'Malignant' ? 'rgba(255, 175, 175, 1)' : 'rgba(175, 175, 255, 1)'),
            hoverBorderColor: cookies.predictions.map(prediction => prediction === 'Malignant' ? 'rgba(255, 175, 175, 1)' : 'rgba(175, 175, 255, 1)'),
            pointRadius: cookies.confidences.map(confidence => parseFloat(confidence) * 0.01 * 20),
            pointHoverRadius: cookies.confidences.map(confidence => parseFloat(confidence) * 0.01 * 40),
        }]
    }

    let scatterOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'category',
                labels: cookies.timestamps.map(timestamp => convertTimestampToDate(timestamp)),
            },
            y: {
                type: 'category',
                labels: ['Malignant', 'Benign'],
                grid: {
                    display: false,
                },
                title: {
                    display: true,
                    text: 'Prediction, Size=Confidence'
                }
            }
        }
    }

    let scatterChart = new Chart(document.getElementById('scatterChart'), {
        type: 'scatter',
        data: scatterData,
        options: scatterOptions
    })

    // create bar chart
    // x axis: prediction
    // y axis: frequency
    let predictionFrequency = {
        labels: ['Benign', 'Malignant'],
        datasets: [{
            label: 'Prediction Frequency',
            data: [cookies.predictions.filter(prediction => prediction === 'Benign').length, cookies.predictions.filter(prediction => prediction === 'Malignant').length],
            backgroundColor: ['rgba(175, 175, 255, 0.5)', 'rgba(255, 175, 175, 0.5)'],
            borderColor: ['rgba(175, 175, 255, 1)', 'rgba(255, 175, 175, 1)'],
            borderWidth: 1
        }]
    }

    let predictionFrequencyOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: Math.max(...predictionFrequency.datasets[0].data) + 1
            }
        }
    }

    let predictionFrequencyChart = new Chart(document.getElementById('barChart'), {
        type: 'bar',
        data: predictionFrequency,
        options: predictionFrequencyOptions
    })

    // create donut chart
    // width = count of prediction

    let donutData = {
        labels: ['Benign', 'Malignant'],
        datasets: [{
            data: [cookies.predictions.filter(prediction => prediction === 'Benign').length, cookies.predictions.filter(prediction => prediction === 'Malignant').length],
            backgroundColor: ['rgba(175, 175, 255, 0.5)', 'rgba(255, 175, 175, 0.5)'],
            borderColor: ['rgba(175, 175, 255, 1)', 'rgba(255, 175, 175, 1)'],
            hoverOffset: 4
        }]
    }

    let donutChart = new Chart(document.getElementById('donutChart'), {
        type: 'doughnut',
        data: donutData
    })

    // line chart with confidence intervals

    let lineData = {
        labels: cookies.timestamps.map(timestamp => convertTimestampToDate(timestamp)),
        datasets: [{
            label: "Predictions",
            data: cookies.predictions,
            borderColor: 'rgba(175, 175, 255, 1)',
            backgroundColor: 'rgba(175, 175, 255, 0.5)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(175, 175, 255, 1)',
        },
        {
            label: 'Confidence Level',
            data: cookies.confidences,
            fill: false,
            borderColor: 'rgba(255, 175, 175, 1)',
            borderWidth: 1,
            backgroundColor: 'rgba(255, 175, 175, 0.5)',
            hoverBackgroundColor: 'rgba(255, 175, 175, 1)',
            borderDash: [5, 5],
        }]
    }

    let lineOptions = {
        scales: {
            x: {
                type: 'category',
                position: 'bottom',
                labels: cookies.timestamps.map(timestamp => convertTimestampToDate(timestamp)),
            }
        }
    }

    let lineChart = new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: lineData,
        options: lineOptions
    })

})
