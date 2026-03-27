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

export const subscribeBrowserPush = async () => {
    if (!isPushSupported()) {
        throw new Error("Push notifications are not supported in this browser.");
    }

    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
        throw new Error("VITE_VAPID_PUBLIC_KEY is missing in frontend environment.");
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
        throw new Error("Notification permission was not granted.");
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
