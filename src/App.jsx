import { useEffect, useRef, useState } from 'react';
import './styles.css';
import Lottie from 'lottie-web';

function App() {
  const [isReady, setIsReady] = useState(false);
  const [onesignalId, setOnesignalId] = useState(null);
  const [showMarquee, setShowMarquee] = useState(true);
  const [emailDisplay, setEmailDisplay] = useState(null); // For UI display
  const emailRef = useRef(null); // For Glide payload

  // Extract email from URL and store in both ref and state
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");

    if (emailParam) {
      const decodedEmail = decodeURIComponent(emailParam);
      console.log("Extracted email:", decodedEmail);
      emailRef.current = decodedEmail;
      setEmailDisplay(decodedEmail);
    } else {
      console.warn("No email found in URL");
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
      });

      OneSignal.Notifications.addEventListener("permissionPromptDisplay", () => {
        console.log("Permission prompt displayed.");
        setShowMarquee(false);
      });

      OneSignal.Notifications.addEventListener("permissionChange", (granted) => {
        console.log("Permission changed:", granted);
      });

      OneSignal.Notifications.addEventListener("click", (event) => {
        console.log("Notification clicked:", event);
      });

      OneSignal.User.PushSubscription.addEventListener("change", async (event) => {
        if (event.current?.token) {
          console.log("Push token received!");
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
              alert("Sent OneSignal ID and email to Glide!");
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

  const handlePrompt = async () => {
    try {
      await window.OneSignal.Slidedown.promptPush({ force: true });

      const state = await window.OneSignal.User.PushSubscription.get();
      console.log("Push subscription state:", state);

      if (!state.optedIn) {
        alert("You need to allow notifications to continue.");
      }

      setShowMarquee(false);
    } catch (err) {
      console.error("Prompt error:", err);
    }
  };

  return (
    <div className="App">
      <div id="lottie-container" style={{ width: 200, height: 200 }}></div>
      <h1>OneSignal + Glide Integration</h1>

      {showMarquee && (
        <div className="marquee-container">
          <marquee behavior="scroll" direction="left">
            Please wait for the prompt to show up, and click the prompt if it shows up!
          </marquee>
        </div>
      )}

      {onesignalId && (
        <div className="status-box">
          <div className="label">OneSignal ID:</div>
          <div className="id">{onesignalId}</div>

          {emailDisplay && (
            <>
              <div className="label" style={{ marginTop: '1rem' }}>Email:</div>
              <div className="id">{emailDisplay}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
