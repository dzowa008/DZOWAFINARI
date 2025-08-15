// Animation utilities and helpers

export const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6 }
};

export const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6 }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.6 }
};

// Loading animation stages
export const loadingStages = [
  { stage: 'Initializing application...', duration: 800 },
  { stage: 'Loading user preferences...', duration: 600 },
  { stage: 'Connecting to AI services...', duration: 700 },
  { stage: 'Preparing dashboard...', duration: 500 },
  { stage: 'Almost ready...', duration: 400 }
];

// Simulate network delay
export const simulateNetworkDelay = (min: number = 500, max: number = 2000): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Progress animation helper
export const animateProgress = async (
  setProgress: (progress: number) => void,
  targetProgress: number,
  duration: number = 1000
): Promise<void> => {
  return new Promise(resolve => {
    let currentProgress = 0;
    const increment = targetProgress / (duration / 16); // 60fps
    
    const animate = () => {
      currentProgress += increment;
      if (currentProgress >= targetProgress) {
        setProgress(targetProgress);
        resolve();
      } else {
        setProgress(currentProgress);
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  });
};

// Typing animation for text
export const typeWriter = async (
  text: string,
  setText: (text: string) => void,
  speed: number = 50
): Promise<void> => {
  return new Promise(resolve => {
    let i = 0;
    const timer = setInterval(() => {
      setText(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(timer);
        resolve();
      }
    }, speed);
  });
};

// Stagger animation for lists
export const staggerChildren = (index: number, delay: number = 100) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { 
    duration: 0.6,
    delay: index * (delay / 1000)
  }
});

// Bounce animation
export const bounceIn = {
  initial: { opacity: 0, scale: 0.3 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
};

// Pulse animation
export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Floating animation
export const float = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Rotate animation
export const rotate = {
  animate: {
    rotate: 360,
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }
  }
};