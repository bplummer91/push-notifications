import { useEffect, useRef, useState } from 'react';
import './styles.css';
import Lottie from 'lottie-web';

function App() {
  const [isReady, setIsReady] = useState(false);
  const [onesignalId, setOnesignalId] = useState(null);
  const [showMarquee, setShowMarquee] = useState(true);
  const [emailDisplay, setEmailDisplay] = useState(null);
  const emailRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");

    if (emailParam) {
      const decodedEmail = decodeURIComponent(emailParam);
      emailRef.current = decodedEmail;
      setEmailDisplay(decodedEmail);
    }
  }, []);

  useEffect(() => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async function (OneSignal) {
      await OneSignal.init({
        appId: "77b6a51d-65ff-4266-aafc-2a97c65d13cb",
        serviceWorkerPath: "OneSignalSDKWorker.js",
        serviceWorkerUpdaterPath: "OneSignalSDKUpdaterWorker.js",
        serviceWorkerParam: { scope: "/" },
        autoResubscribe: true,
        autoRegister: false,
        allowLocalhostAsSecureOrigin: true,
        origin: window.location.origin.includes('localhost') || window.location.origin.includes('webcontainer') 
          ? window.location.origin 
          : "https://push-notifications-2to4.vercel.app"
      });

      OneSignal.Notifications.addEventListener("permissionPromptDisplay", () => {
        setShowMarquee(false);
      });

      OneSignal.Notifications.addEventListener("permissionChange", (granted) => {
        console.log("Permission changed:", granted);
      });

      OneSignal.User.PushSubscription.addEventListener("change", async (event) => {
        if (event.current?.token) {
          const onesignalId = event.current.id;
          setOnesignalId(onesignalId);
          setShowMarquee(false);

          try {
            const response = await fetch(
              "Your Glide Workflow here",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": "Bearer your Glide API Key here"
                },
                body: JSON.stringify({
                  onesignalUserId: onesignalId,
                  email: emailRef.current
                })
              }
            );

            if (!response.ok) {
              const text = await response.text();
              console.error("Failed to send to Glide:", text);
            } else {
              alert("Successfully connected!");
            }
          } catch (err) {
            console.error("Error sending data to Glide:", err);
          }
        }
      });

      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    if (isReady) {
      Lottie.loadAnimation({
        container: document.querySelector("#lottie-container"),
        animationData: require("./animation/animation.json"),
        renderer: "svg",
        loop: true,
        autoplay: true
      });
    }
  }, [isReady]);

  return (
    <div className="App">
      <div id="lottie-container" style={{ width: 150, height: 150 }}></div>
      <h1>Push Notification Setup</h1>

      {showMarquee && (
        <div className="marquee-container">
          <p style={{ textAlign: 'center', margin: 0 }}>
            Waiting for notification prompt...
          </p>
        </div>
      )}

      {onesignalId && (
        <div className="status-box">
          <div className="label">Device ID</div>
          <div className="id">{onesignalId}</div>

          {emailDisplay && (
            <>
              <div className="label" style={{ marginTop: '1rem' }}>Email</div>
              <div className="id">{emailDisplay}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;