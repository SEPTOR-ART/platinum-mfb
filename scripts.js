function openSidebar() {
  document.getElementById("sidebar").style.width = "250px";
  document.getElementById("sidebar").setAttribute("aria-hidden", "false");
}

function closeSidebar() {
  document.getElementById("sidebar").style.width = "0";
  document.getElementById("sidebar").setAttribute("aria-hidden", "true");
}

// Add animation to elements
document.addEventListener('DOMContentLoaded', function() {
  const animatedElements = document.querySelectorAll('.animate-fadeInUp');
  animatedElements.forEach((element, index) => {
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 200 * index);
  });
});