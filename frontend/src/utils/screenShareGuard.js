let monitorInstalled = false;
let activeDisplayCaptures = 0;

const decrementCapture = () => {
  activeDisplayCaptures = Math.max(0, activeDisplayCaptures - 1);
};

export const installDisplayCaptureMonitor = () => {
  if (monitorInstalled) {
    return;
  }

  const mediaDevices = navigator.mediaDevices;
  if (!mediaDevices || typeof mediaDevices.getDisplayMedia !== "function") {
    monitorInstalled = true;
    return;
  }

  const originalGetDisplayMedia = mediaDevices.getDisplayMedia.bind(mediaDevices);

  mediaDevices.getDisplayMedia = async (...args) => {
    const stream = await originalGetDisplayMedia(...args);

    if (stream) {
      activeDisplayCaptures += 1;
      stream.getTracks().forEach((track) => {
        track.addEventListener("ended", decrementCapture, { once: true });
      });
    }

    return stream;
  };

  monitorInstalled = true;
};

export const getActiveDisplayCaptureCount = () => activeDisplayCaptures;
