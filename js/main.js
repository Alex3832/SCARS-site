window.addEventListener("load", (event) => {
    checkCancerLabels()
});


document.querySelector('input[type="file"]').addEventListener('change', function() {
    if (this.files && this.files[0]) {
      	let imageContainer = document.getElementById('drop-image');
        imageContainer.innerHTML = "<img id='uploaded-image'>";
        let img = document.getElementById('uploaded-image');
        img.onload = () => {
            URL.revokeObjectURL(img.src);  // no longer needed, free memory
        }

        img.src = URL.createObjectURL(this.files[0]); // set src to blob url
    }
})
      
// detect if any of the cancer labels are overflowing
// if so, apply auto-text scroll animation
window.addEventListener("resize", (event) => {
    checkCancerLabels()
});

function checkCancerLabels() {
    let cancerLabels = document.getElementsByTagName("label")
    for (const label of cancerLabels) {
        labelParent = label.parentElement;
        if (labelParent.scrollWidth >  Math.max(labelParent.offsetWidth, labelParent.clientWidth)) {
            label.classList.add("text-scroll-animation")
        } else {
            label.classList.remove("text-scroll-animation")
        }
    }
}