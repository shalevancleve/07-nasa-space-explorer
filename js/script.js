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

// Function to fetch and display images
getImagesButton.addEventListener('click', () => {
  // Get the selected start and end dates from the inputs
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Build the API URL with the selected dates
  const url = `${NASA_API_URL}?api_key=${NASA_API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  // Show loading message
  gallery.innerHTML = '<p>Loading images...</p>';

  // Fetch data from NASA APOD API
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Clear the gallery
      gallery.innerHTML = '';

      // If the API returns a single object (not an array), wrap it in an array
      const images = Array.isArray(data) ? data : [data];

      // Only keep the first 9 images
      const firstNine = images.slice(0, 9);

      // Loop through each image and create a gallery item
      firstNine.forEach(item => {
        // Only show images (not videos)
        if (item.media_type === 'image') {
          // Create a div for the gallery item
          const div = document.createElement('div');
          div.className = 'gallery-item';

          // Set the inner HTML with image, title, and date
          div.innerHTML = `
            <img src="${item.url}" alt="${item.title}" />
            <h3>${item.title}</h3>
            <p>${item.date}</p>
          `;

          // When the gallery item is clicked, open the modal
          div.addEventListener('click', () => {
            openModal(item);
          });

          // Add the item to the gallery
          gallery.appendChild(div);
        }
      });

      // If no images found, show a message
      if (gallery.children.length === 0) {
        gallery.innerHTML = '<p>No images found for this date range.</p>';
      }
    })
    .catch(error => {
      // Show error message if something goes wrong
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

// Function to open the modal with image info
function openModal(item) {
  // Use the HD image if available, otherwise use the normal image
  modalImg.src = item.hdurl || item.url;
  modalImg.alt = item.title;
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;
  modal.style.display = 'flex';
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