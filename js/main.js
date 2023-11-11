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
      
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", mobileMenu);

function mobileMenu() {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
}

const navLink = document.querySelectorAll(".nav-link");

navLink.forEach(n => n.addEventListener("click", closeMenu));

function closeMenu() {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}


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