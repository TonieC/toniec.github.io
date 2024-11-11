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
  
  

document.addEventListener("DOMContentLoaded", () => {
    const projectItems = document.querySelectorAll(".project-item");
    const gridSize = 3; // Adjust for the 3x3 grid

    projectItems.forEach((item, index) => {
        item.addEventListener("mouseenter", () => {
            const row = Math.floor(index / gridSize);
            const col = index % gridSize;

            item.classList.add("hovered");

            // Loop through all items to apply the "push" effect
            projectItems.forEach((otherItem, otherIndex) => {
                const otherRow = Math.floor(otherIndex / gridSize);
                const otherCol = otherIndex % gridSize;

                // Calculate row and column differences
                const rowDiff = otherRow - row;
                const colDiff = otherCol - col;

                // Skip the hovered item itself
                if (otherItem !== item) {
                    // Apply push effect based on position
                    otherItem.style.transform = `translate(${colDiff * 10}%, ${rowDiff * 10}%)`;
                }
            });
        });

        // Reset transforms on mouse leave
        item.addEventListener("mouseleave", () => {
            item.classList.remove("hovered");

            // Reset all items' transforms
            projectItems.forEach((otherItem) => {
                otherItem.style.transform = "translate(0, 0)";
            });
        });
    });
});
