import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import googleServices from "./google-services.json";

// Derive Firebase config from android google-services.json
const firebaseConfig = (() => {
  try {
    const projectInfo = googleServices.project_info || {};
    const client = (googleServices.client && googleServices.client[0]) || {};
    const apiKey =
      client.api_key && client.api_key[0] && client.api_key[0].current_key;
    const appId = client.client_info && client.client_info.mobilesdk_app_id;
    const projectId = projectInfo.project_id;
    const messagingSenderId = projectInfo.project_number;

    return {
      apiKey,
      appId,
      projectId,
      messagingSenderId,
    };
  } catch (error) {
    console.error("Failed to build Firebase config from google-services.json", error);
    return {};
  }
})();

let app;

export function getFirebaseApp() {
  if (!app) {
    if (getApps().length > 0) {
      app = getApp();
    } else {
      app = initializeApp(firebaseConfig);
    }
  }
  return app;
}

export function getFirebaseAuth() {
  const firebaseApp = getFirebaseApp();
  return getAuth(firebaseApp);
}




