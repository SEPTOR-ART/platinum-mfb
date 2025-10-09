function openSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar.style.width !== "250px") {
    sidebar.style.width = "250px";
    sidebar.setAttribute("aria-hidden", "false");
  }
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (sidebar.style.width !== "0px") {
    sidebar.style.width = "0";
    sidebar.setAttribute("aria-hidden", "true");
  }
}

// Add animation to elements
document.addEventListener('DOMContentLoaded', function() {
  const animatedElements = document.querySelectorAll('.animate-fadeInUp');
  animatedElements.forEach((element, index) => {
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 200 * index);
  });
});
