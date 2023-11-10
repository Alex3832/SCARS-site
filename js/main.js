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
      
