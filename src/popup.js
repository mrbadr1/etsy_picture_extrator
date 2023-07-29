document.addEventListener('DOMContentLoaded', function() {
    const extractButton = document.getElementById('extractButton');
    const pictureLinkInput = document.getElementById('pictureLink');
    const pictureContainer = document.getElementById('pictureContainer');
  
    extractButton.addEventListener('click', function() {
      const pictureLink = pictureLinkInput.value;
      if (pictureLink) {
        const img = document.createElement('img');
        img.src = pictureLink;
        pictureContainer.appendChild(img);
      }
    });
  });
  