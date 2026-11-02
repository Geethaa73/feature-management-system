import { useEffect, useState } from "react";
import {
  MdDownload,
  MdInstallMobile,
  MdClose,
  MdCheckCircle,
} from "react-icons/md";

import "../styles/pwaInstall.css";

function PWAInstall() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      const standalone =
        window.matchMedia(
          "(display-mode: standalone)"
        ).matches;

      const iosStandalone =
        window.navigator.standalone === true;

      setIsInstalled(
        standalone || iosStandalone
      );
    };

    checkInstalled();

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();

      setInstallPrompt(event);
      setShowBanner(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setShowBanner(false);
      setInstalling(false);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener(
      "appinstalled",
      handleAppInstalled
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        "appinstalled",
        handleAppInstalled
      );
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      return;
    }

    try {
      setInstalling(true);

      await installPrompt.prompt();

      const result =
        await installPrompt.userChoice;

      if (result.outcome === "accepted") {
        setIsInstalled(true);
        setShowBanner(false);
      }
    } catch (error) {
      console.error(
        "PWA installation failed:",
        error
      );
    } finally {
      setInstalling(false);
      setInstallPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (isInstalled || !showBanner) {
    return null;
  }

  return (
    <div className="pwa-install-wrapper">
      <div className="pwa-install-card">

        <div className="pwa-install-icon">
          <MdInstallMobile />
        </div>

        <div className="pwa-install-content">
          <strong>
            Install FeatureOps
          </strong>

          <span>
            Install FeatureOps on your device
            for a faster app-like experience.
          </span>
        </div>

        <button
          type="button"
          className="pwa-install-button"
          onClick={handleInstall}
          disabled={installing}
        >
          {installing ? (
            <>
              <span className="pwa-spinner" />
              Installing...
            </>
          ) : (
            <>
              <MdDownload />
              Install
            </>
          )}
        </button>

        <button
          type="button"
          className="pwa-dismiss-button"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          title="Dismiss"
        >
          <MdClose />
        </button>

      </div>
    </div>
  );
}

export default PWAInstall;