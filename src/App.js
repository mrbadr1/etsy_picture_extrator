import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  // State variables
  const [mediaItems, setMediaItems] = useState([]);
  const [selectedMediaItems, setSelectedMediaItems] = useState([]);

  useEffect(() => {
    // Fetch media items when the component mounts
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const etsyUrl = currentTab.url;
      fetchMediaItems(etsyUrl);
    });
  }, []);

  const fetchMediaItems = (url) => {
    fetch(url)
      .then((response) => response.text())
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
  
        // Fetch the main product image first
        const mainProductImageElement = doc.querySelector('img[data-perf-group="main-product-image"]');
        const mainProductImage = mainProductImageElement ? {
          type: 'picture',
          url: mainProductImageElement.getAttribute('src'),
        } : null;
  
        const mediaElements = doc.querySelectorAll(
          'img.wt-animated.wt-display-none.wt-max-width-full, video#listing-video-1'
        );
  
        const mediaItems = Array.from(mediaElements).map((media) => {
          if (media.tagName === 'IMG') {
            return {
              type: 'picture',
              url: media.getAttribute('data-src-delay'),
            };
          } else if (media.tagName === 'VIDEO') {
            return {
              type: 'video',
              url: media.querySelector('source')?.getAttribute('src'),
            };
          }
        });
  
        // Filter out the specific image from the video
        const filteredMediaItems = mediaItems.filter(mediaItem => mediaItem.url !== 'https://v.etsystatic.com/video/upload/ar_1:1,c_fill,h_105,q_auto,w_105/positive_svg_w2e4xj.jpg');
  
        // If the main product image was found, add it to the beginning of the array
        if (mainProductImage) {
          filteredMediaItems.unshift(mainProductImage);
        }
  
        setMediaItems(filteredMediaItems);
      })
      .catch((error) => {
        console.error('Error fetching media items:', error);
      });
  };
  

  const handleDownload = () => {
    selectedMediaItems.forEach((mediaItem, index) => {
      const fileExtension = mediaItem.url.split('.').pop(); // Get the file extension from the URL
      const fileName = `picture_${index + 1}.${fileExtension}`; // Construct the file name with position and extension

      const originalSizeUrl = mediaItem.url.replace(/\/il_[^/]+x/, '/il_fullxfull'); // Replace the image size in the URL with 'il_fullxfull'

      fetch(originalSizeUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName; // Set the file name with the position and extension
          link.style.display = 'none'; // Hide the link element
          document.body.appendChild(link); // Append the link element to the document body
          link.click();
          document.body.removeChild(link); // Remove the link element from the document body
          URL.revokeObjectURL(url);
        })
        .catch((error) => {
          console.error('Error downloading media:', error);
        });
    });
  };

  const handleMediaSelect = (mediaItem) => {
    if (selectedMediaItems.includes(mediaItem)) {
      setSelectedMediaItems(selectedMediaItems.filter((item) => item !== mediaItem));
    } else {
      setSelectedMediaItems([...selectedMediaItems, mediaItem]);
    }
  };
const handleShowOriginalSize = (mediaItem) => {
  const originalSizeUrl = mediaItem.url.replace(/\/il_[^/]+x/, '/il_fullx');
  if (mediaItem.type === 'video') {
    // If the media is a video, open it in Picture-in-Picture mode
    const videoElement = document.createElement('video');
    videoElement.src = originalSizeUrl;
    videoElement.controls = true;

    // Listen for the 'loadedmetadata' event to ensure the video is ready before entering PiP
    videoElement.addEventListener('loadedmetadata', () => {
      if (document.pictureInPictureElement) {
        // If another element is already in PiP, exit PiP before entering a new one
        document.exitPictureInPicture().then(() => videoElement.requestPictureInPicture());
      } else {
        // If no element is in PiP, enter PiP directly
        videoElement.requestPictureInPicture();
      }
    });

    // Listen for the 'leavepictureinpicture' event to remove the video element from the DOM when PiP is closed
    videoElement.addEventListener('leavepictureinpicture', () => {
      videoElement.remove();
    });

    // Add the video element to the document body to trigger PiP
    document.body.appendChild(videoElement);
  } else {
    // If the media is an image, open the URL in a new tab
    window.open(originalSizeUrl, '_blank', 'noopener,noreferrer');
  }
};

return (
  <div className="container">
    <h1 className="heading">Etsy Picture Extractor</h1>
    <div className="media-list">
      {mediaItems.map((mediaItem, index) => (
        <div key={index} className={`media-item ${index === 0 ? 'main-product-picture' : ''}`}>
          {/* Existing media item display */}
          {mediaItem.type === 'video' ? (
            <video src={mediaItem.url} controls className="media-item-thumbnail" />
          ) : (
            <img src={mediaItem.url} alt="Picture" className="media-item-thumbnail" />
          )}
          <input
            type="checkbox"
            checked={selectedMediaItems.includes(mediaItem)}
            onChange={() => handleMediaSelect(mediaItem)}
            className="checkbox"
          />
          {mediaItem.type === 'picture' && (
            <button onClick={() => handleShowOriginalSize(mediaItem)} className="button">
              {mediaItem.type === 'video' ? 'Watch in PiP' : 'Show Original Size'}
            </button>
          )}
        </div>
      ))}
    </div>
    {selectedMediaItems.length > 0 && (
      <div className="download-section">
        <button onClick={handleDownload} className="download-button">
          Download Selected Media
        </button>
      </div>
    )}
  </div>
);
}

export default App;
