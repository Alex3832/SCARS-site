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
            // If it's a text/plain item, try to handle it as a URL
            item.getAsString(async (url) => {
                let [urlIsImage, imageType] = await isImageURL(url);
                if (urlIsImage) {
                    let imageFile = urlToImageFile(url, imageType);
                    predict(imageFile)
                } else {
                    alert("Unable to convert URL to image.")
                }
            });
        }
        });
    } else {
        // Use DataTransfer interface to access the file(s)
        [...ev.dataTransfer.files].forEach((file, i) => {
          console.log('file[${i}].name = ${file.name}');
        });
    }
}

function isImageURL(url) {
    // checks if the url is an image
    return fetch(url, {method: 'HEAD'})
        .then(res => {
            if (res.ok) {
                const contentType = res.headers.get('Content-Type');
                
                return [contentType.startsWith('image/'), contentType];
            } else {
                alert("URL is not valid.")
                return [false, null];
            }
        }).catch(err => {
            console.error(err)
            return [false, null];
        })
}

async function urlToImageFile(url, imageType) {
    return fetch(url)
        .then(response => response.blob())
        .then(blob => {
            return new File([blob], 'image', {type: imageType});
        })
        .catch(error => {
            console.error('Error converting image URL to Blob:', error);
            throw error;
        });
}


async function predict(file) {
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

function openModal(prediction, confidence) {
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
}

function closeModal() {
    document.getElementById("overlay").style.display = "none";
    document.body.style.overflow = "auto";
    document.getElementById("confidence").style.width = "0%"
    document.getElementById("drop-image").innerHTML = `
    <label for="upload-button" id="upload-label">Select a File</label>
    <input id="upload-button" type="file" accept="image/jpeg, image/png">
    <h3>or drop an image here</h3>
    <h4>or paste or input a <span onclick="inputURL()" id="url-paste">url</span></h4>
    `
    document.querySelector('input[type="file"]').addEventListener('change', async function() {
        if (this.files && this.files[0]) {
            predict(this.files[0])
        }
    })
}