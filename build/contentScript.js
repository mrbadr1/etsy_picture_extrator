// contentScript.js

// Function to add a button above the image
function addButtonAboveImage(imgElement) {
  const button = document.createElement('button');
  button.textContent = 'Download';
  button.addEventListener('click', () => {
    // Code to handle download
    const a = document.createElement('a');
    a.href = imgElement.src;
    a.download = 'download.jpg'; // or any other name you want
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
  imgElement.parentElement.insertBefore(button, imgElement);
}

// Create a MutationObserver to watch for changes in the DOM
const observer = new MutationObserver((mutationsList, observer) => {
  for(let mutation of mutationsList) {
    if (mutation.type === 'childList') {
      document.querySelectorAll('img.wt-max-width-full.wt-horizontal-center.wt-vertical-center.carousel-image.wt-rounded').forEach(addButtonAboveImage);
    }
  }
});

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });
