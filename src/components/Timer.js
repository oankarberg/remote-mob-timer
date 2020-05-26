import fbase from "firebase/app";
import React, { memo, useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Col, Row } from "../ui-wrapper";

const timeToString = (minutes, seconds) => {
  let str = "";
  str += minutes < 1 ? "00:" : `${minutes}:`;
  str += seconds < 10 ? `0${seconds}` : `${seconds}`;
  return str;
};

export const Timer = memo(
  ({ timerEndsAt, timerDoneCb, idleValue, isRunning }) => {
    const [timeLeftStr, setTimeLeftStr] = useState(null);

    // keep function reference
    const updateTimeCb = useCallback(
      (millisecondsLeft) => {
        const secsLeft = millisecondsLeft / 1000;
        const minutes = Math.floor(secsLeft / 60);

        const divisorForSeconds = secsLeft % 60;
        const seconds = Math.floor(divisorForSeconds);
        setTimeLeftStr(timeToString(minutes, seconds));
        if (secsLeft < 1) {
          timerDoneCb();
        }
      },
      [timerDoneCb]
    );

    useEffect(() => {
      const countDown = (end) => {
        updateTimeCb(
          Math.max(0, end - fbase.firestore.Timestamp.now().seconds * 1000)
        );
      };

      if (!isRunning) {
        return updateTimeCb(idleValue);
      }
      if (!timerEndsAt) return null;
      countDown(timerEndsAt);
      const interval = setInterval(() => countDown(timerEndsAt), 1000);
      return () => clearInterval(interval);
    }, [isRunning, timerEndsAt, idleValue, updateTimeCb]);

    return (
      <Row className="themed justify-content-center">
        <Col xs="auto">
          <h1 style={{ fontSize: "100px", margin: 0 }}>{timeLeftStr}</h1>
        </Col>
      </Row>
    );
  }
);

Timer.defaultProps = {
  timerEndsAt: null,
};
Timer.propTypes = {
  isRunning: PropTypes.bool.isRequired,
  idleValue: PropTypes.number.isRequired,
  timerDoneCb: PropTypes.func.isRequired,
  timerEndsAt: PropTypes.number, // timestamp
};
