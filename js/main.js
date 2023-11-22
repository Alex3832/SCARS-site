document.querySelector('input[type="file"]').addEventListener('change', async function() {
    if (this.files && this.files[0]) {
        predict(this.files[0])
    }
})

function inputURL() {
    let url = prompt("URL:")
}

document.addEventListener('paste', handlePaste);

async function handlePaste(event) {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            await predict(file);
            return;
        }
    }
}

const dropArea = document.getElementById('drop-image');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop area when a file is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight);
});

function highlight() {
    dropArea.style.border = '2px solid rgb(106, 255, 241)';
}

function unhighlight() {
    dropArea.style.border = 'dotted';
}

// Handle dropped files
dropArea.addEventListener('drop', handleDrop);

async function handleDrop(e) {
    let dt = e.dataTransfer;
    
    if (dt.items) {
        // Use DataTransferItemList interface to access the file(s)
        [...dt.items].forEach((item, i) => {
          // If dropped items aren't files, reject them
          if (item.kind === "file") {
            const file = item.getAsFile();
            console.log('file[${i}].name = ${file.name}');
          } else if (item.kind === 'string' && item.type === 'text/plain') {
            // If it's a text/plain item, it may be a URL.
            alert("Input was either a URL (images dragged from other sites) or text. If dragging image, it must be a file.")
          }
        });
    } else {
        // Use DataTransfer interface to access the file(s)
        [...ev.dataTransfer.files].forEach((file, i) => {
          console.log('file[${i}].name = ${file.name}');
        });
    }
}

async function predict(file) {
    openLoading()
    let imageContainer = document.getElementById('drop-image');
    imageContainer.innerHTML = "<img id='uploaded-image'>";
    let image = document.getElementById('uploaded-image');
    image.onload = () => {
        URL.revokeObjectURL(img.src);  // no longer needed, free memory
    }
    image.src = URL.createObjectURL(file); 

    reader = new FileReader()

    reader.onload = async function(e) {
        const img = new Image()
        img.src = e.target.result

        img.onload = async function() {
            image_width = 224
            image_height = 224
            // convert into pixel format
            // that the model expects
            const tensor = tf.browser.fromPixels(img)
                .resizeBilinear([image_width,image_height])
                .toFloat()
                .div(tf.scalar(255))
                .expandDims()

            // load model
            let modelPath = "../model/model.json"
            const model = await tf.loadLayersModel(modelPath)
            
            // predict
            const predictions = model.predict(tensor)
            const predictionsData = await predictions.data()

            const predictedClass = predictionsData[0] > 0.5 ? "Malignant" : "Benign"
            console.log(predictionsData[0])
            const confidenceOfClass = predictedClass == "Malignant" ? predictionsData[0] : 1 - predictionsData[0]

            openModal(predictedClass, (confidenceOfClass * 100).toFixed(2))

            //clear up memory
            tensor.dispose();
        }
    }

    reader.readAsDataURL(file)
}

function openLoading() {
    document.getElementById("loading-overlay").style.display = "flex";
    document.body.style.overflow = "hidden";
}

function openModal(prediction, confidence) {
    document.getElementById("loading-overlay").style.display = "none"

    document.getElementById("overlay").style.display = "flex";
    document.body.style.overflow = "hidden";

    document.getElementById("prediction").innerHTML = prediction
    document.getElementById("confidence-number").innerHTML = confidence + "%"

    if (confidence < 60) {
        document.getElementById("confidence").style.backgroundColor = "lightgreen"
    } else if (confidence < 80) {
        document.getElementById("confidence").style.backgroundColor = "orange"
    } else {
        document.getElementById("confidence").style.backgroundColor = "lightcoral"
    }

    setTimeout(() => {
        document.getElementById("confidence").style.width = confidence + "%"
    }, 300)

    document.getElementById("save-button").onclick = () => {
        // creates persistent cookie of result on click
        let cookieValue = {
            prediction: prediction,
            confidence: confidence,
            timestamp: new Date().getTime(),
        }

        let jsonCookieValue = JSON.stringify(cookieValue)
        let cookieName = "predictionData_" + cookieValue.timestamp
        document.cookie = cookieName + "=" + encodeURIComponent(jsonCookieValue) + "; expires=" + new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10) + "; path=/"
        closeModal() // prevent double saving the same data if possible
    }
}

function closeModal() {
    document.getElementById("overlay").style.display = "none";
    document.body.style.overflow = "auto";
    document.getElementById("confidence").style.width = "0%"
    document.getElementById("drop-image").innerHTML = `
    <label for="upload-button" id="upload-label">Select a File</label>
    <input id="upload-button" type="file" accept="image/jpeg, image/png">
    <h3>or drop an image here</h3>
    <h4>or paste</h4>
    `
    document.querySelector('input[type="file"]').addEventListener('change', async function() {
        if (this.files && this.files[0]) {
            predict(this.files[0])
        }
    })
}