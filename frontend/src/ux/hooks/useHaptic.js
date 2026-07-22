export default function useHaptic() {
  const supported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const light = () => { if (supported) navigator.vibrate(10); };
  const medium = () => { if (supported) navigator.vibrate(20); };
  const heavy = () => { if (supported) navigator.vibrate(40); };
  const selection = () => { if (supported) navigator.vibrate(5); };
  const success = () => { if (supported) navigator.vibrate([10, 30, 10]); };
  const warning = () => { if (supported) navigator.vibrate([20, 50, 20]); };
  const error = () => { if (supported) navigator.vibrate([50, 30, 50]); };
  const custom = (pattern) => { if (supported) navigator.vibrate(pattern); };

  return { supported, light, medium, heavy, selection, success, warning, error, custom };
}
