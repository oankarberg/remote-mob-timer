/* eslint-disable jsx-a11y/media-has-caption */
import React, { useCallback, useRef, useState } from "react";
import Noti from "react-web-notification";

export const withNotification = (WrappedComponent) => {
  const EnhancedComponent = (props) => {
    const [ignore, setIgnore] = useState({ status: false, message: "" });
    const audioRef = useRef(null);

    const [message, setMessage] = useState({ title: "", options: null });
    const handlePermissionGranted = () => {
      console.log("Permission Granted ");
    };

    const handlePermissionDenied = () => {
      setIgnore({
        status: true,
        message:
          "Web notifications are blocked, allow them in browser settings to get notifications",
      });
      console.log("Permission Denied ");
    };

    const handleNotificationOnShow = () => {
      const audioPromise = audioRef.current.play();
      if (audioPromise !== undefined) {
        audioPromise.catch((err) => {
          // catch dom exception
          console.log(err);
        });
      }
    };
    const handleNotificationOnClick = () => {
      console.log("handleNotificationOnClick ");
    };
    const handleNotificationOnClose = () => {
      // console.log("handleNotificationOnClose");
    };
    const handleNotificationOnError = () => {
      console.log("Permission Denied ");
    };

    const handleNotSupported = () => {
      setIgnore({
        status: true,
        message: "Web notifications are not supported",
      });
      console.log("Web Notification not Supported");
    };

    const addNotification = useCallback(
      ({ title = "Remote Mob", body = "Change" } = {}) => {
        const now = Date.now();

        const tag = now;
        const icon = "/android-chrome-512x512.png";
        const options = {
          tag,
          body,
          icon,
          badge: icon,
          lang: "en",
          dir: "ltr",
        };
        setMessage({ title, options });
      },
      []
    );

    return (
      <>
        {ignore.status && (
          <div style={{ textAlign: "center" }}>{ignore.message}</div>
        )}
        <Noti
          ignore={ignore.status && message.title !== ""}
          notSupported={handleNotSupported}
          onPermissionGranted={handlePermissionGranted}
          onPermissionDenied={handlePermissionDenied}
          onShow={handleNotificationOnShow}
          onClick={handleNotificationOnClick}
          onClose={handleNotificationOnClose}
          onError={handleNotificationOnError}
          timeout={5000}
          title={message.title}
          options={message.options}
          //   swRegistration={this.props.swRegistration}
        />
        <audio ref={audioRef} id="sound" preload="auto">
          <source src="./notify.mp3" type="audio/mpeg" />
          <embed hidden autostart="false" loop={false} src="./notify.mp3" />
        </audio>
        <WrappedComponent sendNotification={addNotification} {...props} />
      </>
    );
  };

  return EnhancedComponent;
};
