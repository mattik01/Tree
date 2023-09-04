export const scrollTo = (to, duration, easingFunction = easeInOutQuad) => {
    const start = window.scrollY;
    const change = to - start;
    const startTime = performance.now();
  
    const animateScroll = (timestamp) => {
      const currentTime = timestamp - startTime;
      const scrollProgress = Math.min(currentTime / duration, 1);
      const easedProgress = easingFunction(scrollProgress);
  
      window.scrollTo(0, start + change * easedProgress);
  
      if (currentTime < duration) {
        requestAnimationFrame(animateScroll);
      }
    };
  
    requestAnimationFrame(animateScroll);
  };
  
  // Easing function: easeInOutQuad
  const easeInOutQuad = (t) => {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  };
  
  export const scrollToTop = () => {
    scrollTo(0, 500); // 0.5 seconds (500 milliseconds) duration
  };
  
  export const scrollDownOneScreen= () => {
    const screenHeight = window.innerHeight;
    scrollTo(screenHeight, 500); // 0.5 seconds (500 milliseconds) duration
  };
  