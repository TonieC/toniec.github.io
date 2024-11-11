document.addEventListener('DOMContentLoaded', function() {
    // FullPage.js Initialization
    new fullpage('#fullpage', {
      sectionsColor: ['#333', '#f0f0f0', '#d2ffd5', '#b9ffb9'], // Customize background colors for sections
      anchors: ['home', 'about', 'projects', 'contact'], // Define anchor links for sections
      navigation: true, // Enable navigation dots
      navigationPosition: 'right', // Position for navigation dots
      scrollingSpeed: 1000, // Set scrolling speed
      loopBottom: true, // Enable scrolling loop from bottom to top
      loopTop: true, // Enable scrolling loop from top to bottom
    });
  });
  
  
  function toggleDarkMode() {
    document.body.classList.toggle("light-mode");
    document.body.classList.toggle("dark-mode");
}