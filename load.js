document.addEventListener("DOMContentLoaded", function () {
  // Simulate loading process
  setTimeout(function () {
    // Add the "loaded" class to the body to trigger loaded styles
    document.body.classList.add("loaded");
  }, 3000); // Adjust the delay as needed
});
