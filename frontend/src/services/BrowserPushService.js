const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

export const isPushSupported = () => {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
};

export const getNotificationPermission = () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
};

export const requestNotificationPermission = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    throw new Error("Notifications are not supported in this browser.");
  }

  // This must be called in response to user interaction (click, etc.)
  const permission = await Notification.requestPermission();

  if (permission === "denied") {
    throw new Error("Notification permission was denied.");
  }

  if (permission !== "granted") {
    throw new Error("Notification permission was not granted. Please enable in browser settings.");
  }

  return permission;
};

export const subscribeBrowserPush = async () => {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported in this browser.");
  }

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    throw new Error("VITE_VAPID_PUBLIC_KEY is missing in frontend environment.");
  }

  // Check current permission state - assume permission is already granted
  const permission = getNotificationPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission is not granted. Please request permission first.");
  }

  await navigator.serviceWorker.register("/sw.js");
  const readyRegistration = await navigator.serviceWorker.ready;
  const existingSubscription = await readyRegistration.pushManager.getSubscription();

  if (existingSubscription) {
    return existingSubscription.toJSON();
  }

  const subscription = await readyRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  return subscription.toJSON();
};

export const subscribeUser = async () => {
  return subscribeBrowserPush();
};

export const requestPermissionAndSubscribe = async () => {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported in this browser.");
  }

  // Step 1: Request permission (must be called in response to user interaction)
  await requestNotificationPermission();

  // Step 2: Subscribe to push notifications
  const subscription = await subscribeBrowserPush();

  return subscription;
};

export const getCurrentSubscription = async () => {
  if (!isPushSupported()) {
    return null;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return subscription;
};

export const unsubscribeUser = async () => {
  const subscription = await getCurrentSubscription();
  if (!subscription) {
    return null;
  }

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();

  return {
    endpoint,
  };
};
