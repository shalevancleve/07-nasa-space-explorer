// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Find the "Get Space Images" button
const getImagesButton = document.querySelector('.filters button');

// Find the gallery container
const gallery = document.getElementById('gallery');

// NASA APOD API endpoint and API key
const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';
const NASA_API_KEY = 'nfA0esEsh3mANku1FXGzKmUagUOff35UPoNgrdme';

// Array of fun/interesting space facts
const spaceFacts = [
  "A day on Venus is longer than a year on Venus.",
  "Neutron stars can spin at a rate of 600 rotations per second.",
  "One million Earths could fit inside the Sun.",
  "There are more trees on Earth than stars in the Milky Way.",
  "The footprints on the Moon will be there for millions of years.",
  "Jupiter has the shortest day of all the planets.",
  "A spoonful of a neutron star weighs about a billion tons.",
  "Saturn could float in water because it’s mostly made of gas.",
  "Mars has the largest volcano in the solar system: Olympus Mons.",
  "Space is completely silent—there’s no air to carry sound.",
  "The hottest planet in our solar system is Venus.",
  "A year on Mercury is just 88 Earth days.",
  "There are more stars in the universe than grains of sand on Earth.",
  "The International Space Station travels at 28,000 km/h.",
  "A sunset on Mars appears blue to human eyes."
];

// Function to get a random space fact from the array
function getRandomSpaceFact() {
  const index = Math.floor(Math.random() * spaceFacts.length);
  return spaceFacts[index];
}

// Helper function to extract YouTube video ID from various URL formats
function getYouTubeVideoId(url) {
  // This regex matches standard, short, and embed YouTube URLs
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// Function to fetch and display images
getImagesButton.addEventListener('click', () => {
  // Get the selected start and end dates from the inputs
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Build the API URL with the selected dates
  const url = `${NASA_API_URL}?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  // Show loading message with a random space fact
  const fact = getRandomSpaceFact();
  gallery.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center;">
      <p style="font-weight:bold;">Loading images...</p>
      <p style="margin-top:10px; color:#0b3d91;">${fact}</p>
    </div>
  `;

  // Record the time when loading starts
  const loadingStart = Date.now();

  // Fetch data from NASA APOD API
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const elapsed = Date.now() - loadingStart;
      const minDelay = 1000;

      // Function to render the gallery after the delay
      const renderGallery = () => {
        gallery.innerHTML = '';

        const images = Array.isArray(data) ? data : [data];
        const firstNine = images.slice(0, 9);

        firstNine.forEach(item => {
          const div = document.createElement('div');
          div.className = 'gallery-item';

          if (item.media_type === 'image') {
            div.innerHTML = `
              <img src="${item.url}" alt="${item.title}" />
              <h3>${item.title}</h3>
              <p>${item.date}</p>
            `;
            div.addEventListener('click', () => {
              openModal(item);
            });
          } else if (item.media_type === 'video') {
            // Use the helper to get the video ID from any YouTube URL format
            const videoId = getYouTubeVideoId(item.url);
            let videoEmbed = '';
            if (videoId) {
              videoEmbed = `
                <div class="video-wrapper">
                  <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                </div>
              `;
            } else {
              videoEmbed = `
                <a href="${item.url}" target="_blank" rel="noopener" class="video-link">
                  Watch Video
                </a>
              `;
            }
            div.innerHTML = `
              ${videoEmbed}
              <h3>${item.title}</h3>
              <p>${item.date}</p>
            `;
            div.addEventListener('click', () => {
              openModal(item);
            });
          }

          gallery.appendChild(div);
        });

        if (gallery.children.length === 0) {
          gallery.innerHTML = '<p>No images found for this date range.</p>';
        }
      };

      if (elapsed < minDelay) {
        setTimeout(renderGallery, minDelay - elapsed);
      } else {
        renderGallery();
      }
    })
    .catch(error => {
      gallery.innerHTML = `<p>Error loading images. Please try again later.</p>`;
      // For debugging: console.log(error);
    });
});

// Create a modal element and add it to the page
const modal = document.createElement('div');
modal.id = 'image-modal';
// No inline style here; styling will be handled in CSS

// Add modal content HTML (no inline styles)
modal.innerHTML = `
  <div id="modal-content">
    <span id="close-modal">&times;</span>
    <img id="modal-img" src="" alt="" />
    <h3 id="modal-title"></h3>
    <p id="modal-date"></p>
    <p id="modal-explanation"></p>
  </div>
`;
document.body.appendChild(modal);

// Get modal elements for later use
const closeModalBtn = document.getElementById('close-modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalDate = document.getElementById('modal-date');
const modalExplanation = document.getElementById('modal-explanation');

// Function to open the modal with image or video info
function openModal(item) {
  // If it's an image
  if (item.media_type === 'image') {
    modalImg.style.display = '';
    modalImg.src = item.hdurl || item.url;
    modalImg.alt = item.title;
    modalImg.style.maxHeight = '';
    // Remove any previous video iframes
    removeModalVideo();
  }
  // If it's a video
  else if (item.media_type === 'video') {
    modalImg.style.display = 'none';
    removeModalVideo();
    let videoElem;
    const videoId = getYouTubeVideoId(item.url);
    if (videoId) {
      videoElem = document.createElement('iframe');
      videoElem.src = `https://www.youtube.com/embed/${videoId}`;
      videoElem.frameBorder = "0";
      videoElem.allowFullscreen = true;
      videoElem.style.width = "100%";
      videoElem.style.maxWidth = "560px";
      videoElem.style.height = "315px";
      videoElem.style.borderRadius = "4px";
      videoElem.style.background = "#e5e5e5";
    }
    if (!videoElem) {
      videoElem = document.createElement('a');
      videoElem.href = item.url;
      videoElem.target = "_blank";
      videoElem.rel = "noopener";
      videoElem.textContent = "Watch Video";
      videoElem.style.display = "block";
      videoElem.style.margin = "20px 0";
      videoElem.style.color = "#0b3d91";
      videoElem.style.fontWeight = "bold";
      videoElem.style.textDecoration = "underline";
    }
    modalImg.parentNode.insertBefore(videoElem, modalImg.nextSibling);
    videoElem.className = "modal-video";
  }

  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;
  modal.style.display = 'flex';
}

// Helper to remove any video iframe or link from modal
function removeModalVideo() {
  const prevVideo = modal.querySelector('.modal-video');
  if (prevVideo) {
    prevVideo.remove();
  }
}

// Function to close the modal
function closeModal() {
  modal.style.display = 'none';
}

// Close modal when clicking the close button
closeModalBtn.addEventListener('click', closeModal);

// Close modal when clicking outside the modal content
modal.addEventListener('click', function(event) {
  if (event.target === modal) {
    closeModal();
  }
});

// Dropdown toggle for filters
const filtersDropdown = document.querySelector('.filters-dropdown');
const filtersToggle = document.getElementById('filtersToggle');

filtersToggle.addEventListener('click', () => {
  // Toggle the closed class on the dropdown wrapper
  filtersDropdown.classList.toggle('filters-closed');
  // Update aria-expanded for accessibility
  const expanded = filtersToggle.getAttribute('aria-expanded') === 'true';
  filtersToggle.setAttribute('aria-expanded', !expanded);
});

// When the user changes the start date, automatically set the end date to 8 days later
startInput.addEventListener('change', () => {
  // Get the selected start date as a Date object
  const startDateValue = startInput.value;
  if (!startDateValue) return; // Do nothing if no date is selected

  const startDateObj = new Date(startDateValue);

  // Create a new date 8 days after the start date
  const endDateObj = new Date(startDateObj);
  endDateObj.setDate(startDateObj.getDate() + 9);

  // Format the new end date as YYYY-MM-DD
  const yyyy = endDateObj.getFullYear();
  const mm = String(endDateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(endDateObj.getDate()).padStart(2, '0');
  const formattedEndDate = `${yyyy}-${mm}-${dd}`;

  // Set the end date input value, but do not exceed today's date
  const today = new Date().toISOString().split('T')[0];
  endInput.value = (formattedEndDate > today) ? today : formattedEndDate;
});