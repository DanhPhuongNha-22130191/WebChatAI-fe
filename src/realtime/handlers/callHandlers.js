export const handleCallSignal = (response) => {
  window.dispatchEvent(
    new CustomEvent("webrtc-call-signal", {
      detail: response,
    }),
  );
};
