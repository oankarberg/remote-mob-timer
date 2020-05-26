import React, { useEffect, useState, memo, useReducer } from "react";
import { useSelector } from "react-redux";
import { useFirebase, useFirebaseConnect } from "react-redux-firebase";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import {
  findNextTypist,
  findTypistIndex,
  useFirebaseForRoom,
} from "../services/firebase/room";
import { Button, Col, Container, Row, Spinner } from "../ui-wrapper";
import { AddSubInput } from "./InputAddSub";
import { InputOnEnter } from "./InputOnEnter";
import { VerticallyCenteredModal } from "./Modal";
import { ParticipantList } from "./ParticipantList";
import { ThemeSelector } from "./ThemeSelector";
import { Timer } from "./Timer";
import { withNotification } from "./Notification";
import { TIMER_STATUS, ROOM_STATES } from "../services/firebase/model";

const useLastModified = (onPath, setPath) => {
  const firebase = useFirebase();
  // Did mount
  useEffect(() => {
    const query = firebase.database().ref().child(onPath);
    const onChange = () => {
      firebase
        .database()
        .ref(setPath)
        .set(firebase.database.ServerValue.TIMESTAMP);
    };
    query.on("child_changed", onChange);

    return () => query.off("child_changed", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

const initialModalState = {
  shouldShow: false,
  message: {
    content: "",
    header: "",
  },
};

const modalReducer = (state, action) => {
  switch (action.type) {
    case "message":
      return { shouldShow: true, message: action.payload };
    case "hide":
      return { ...state, shouldShow: false };
    default:
      throw new Error();
  }
};

const _Room = ({ sendNotification }) => {
  const firebase = useFirebase();
  let { roomId } = useParams(); // matches todos/:todoId in route
  roomId = `-${roomId}`;

  const roomPath = `rooms/${roomId}/mob`;
  useFirebaseConnect([
    { path: `rooms/${roomId}/mob` }, //
  ]);

  useLastModified(roomPath, `/rooms/${roomId}/lastmodified`);

  const room = useSelector(({ firebase: { data } }) => {
    if (data.rooms && data.rooms[roomId]) {
      const _room = data.rooms[roomId].mob;
      if (!_room.activeParticipants) {
        _room.activeParticipants = [];
      }
      if (!_room.inactiveParticipants) {
        _room.inactiveParticipants = [];
      }
      return _room;
    }
    return null;
  });
  const {
    updateRoomName,
    addPerson,
    moveFromInactiveToActive,
    updateRoomSettings,
    shuffleParticipants,
    removeFromActiveParticipants,
    updateTypist,
    removePerson,
    isRunning,
    startSession,
    stopSession,
    resetSession,
    pauseSession,
    getActiveParticipantsValue,
    getTypist,
    getNextTypist,
    getBreakIn,
  } = useFirebaseForRoom(room, roomPath);

  const [modalState, dispatchModal] = useReducer(
    modalReducer,
    initialModalState
  );

  const nextTypist = getNextTypist();
  useEffect(() => {
    if (!room) return () => {};

    const onChangeState = (snap) => {
      const newValue = snap.val();
      const { state, nextState } = room;
      // If we go from IDLE to BREAK
      const fromIdleToBreak =
        state === ROOM_STATES.IDLE && newValue === ROOM_STATES.BREAK;

      const fromIdleToNormal =
        state === ROOM_STATES.IDLE && newValue === ROOM_STATES.NORMAL;

      const fromAnyToIdle =
        state !== ROOM_STATES.IDLE && newValue === ROOM_STATES.IDLE;

      const isIdleAndNextBreak =
        newValue === ROOM_STATES.IDLE && nextState === ROOM_STATES.BREAK;

      const isIdleAndNextNormal =
        newValue === ROOM_STATES.IDLE && nextState === ROOM_STATES.NORMAL;

      const isIdle = newValue === ROOM_STATES.IDLE;
      if (fromIdleToBreak) {
        sendNotification({
          title: "Remote Mob",
          body: `Go grab a coffee, break started!`,
        });
      }

      if (fromIdleToNormal) {
        // Quick fix to keep up with the updated current Typist
        getActiveParticipantsValue().then((_snap) => {
          const participants = _snap.val();
          const i = findTypistIndex(participants);
          // No current typist, don't send notification.
          if (i < 0) return;
          const currentTypist = participants[i];
          sendNotification({
            title: "Remote Mob",
            body: `${currentTypist.name} is now the typist`,
          });
        });
        // FROM ANY STATE TO IDLE
      }

      if (fromAnyToIdle) {
        if (room.nextState === ROOM_STATES.NORMAL) {
          const _nextTypist = findNextTypist(room.activeParticipants);
          sendNotification({
            title: "Remote Mob",
            body: `Time for ${_nextTypist.name}!`,
          });
        } else if (room.nextState === ROOM_STATES.BREAK) {
          sendNotification({
            title: "Remote Mob",
            body: `Time for a coffee break!`,
          });
        }
      }
      if (isIdleAndNextBreak) {
        dispatchModal({
          type: "message",
          payload: {
            header: "Coffee Break",
            content: "Time for a Coffee break!",
          },
        });
      }
      if (isIdleAndNextNormal) {
        dispatchModal({
          type: "message",
          payload: { header: "Next Typist", content: nextTypist.name },
        });
      }

      if (!isIdle) {
        dispatchModal({ type: "hide" });
      }
    };
    const onChangeTimerStatus = (snap) => {
      const newValue = snap.val();
      const { timerStatus, state, activeParticipants } = room;
      const fromRunningToPaused =
        timerStatus === TIMER_STATUS.RUNNING &&
        newValue === TIMER_STATUS.PAUSED;

      const fromResetStateToRunning =
        newValue === TIMER_STATUS.RUNNING &&
        timerStatus === TIMER_STATUS.NOT_STARTED &&
        state === ROOM_STATES.NORMAL;

      const fromPausedToRunnningNotBreak =
        newValue === TIMER_STATUS.RUNNING &&
        timerStatus === TIMER_STATUS.PAUSED &&
        state === ROOM_STATES.NORMAL;
      if (fromRunningToPaused) {
        sendNotification({
          title: "Remote Mob",
          body: `Paused typist!`,
        });
        // USER HAS CONTINUED FROM A PAUSE
      } else if (fromPausedToRunnningNotBreak) {
        const i = findTypistIndex(activeParticipants);
        // No current typist, don't send notification.
        if (i < 0) return;

        const currentTypist = activeParticipants[i];

        sendNotification({
          title: "Remote Mob",
          body: `${currentTypist.name} continues`,
        });
      } else if (fromResetStateToRunning) {
        const i = findTypistIndex(activeParticipants);
        // No current typist, don't send notification.
        if (i < 0) return;
        const currentTypist = activeParticipants[i];

        sendNotification({
          title: "Remote Mob",
          body: `${currentTypist.name} started mob session`,
        });
      }
    };

    const queryTimerStatus = firebase
      .database()
      .ref()
      .child(`${roomPath}/timerStatus`);
    const queryState = firebase.database().ref().child(`${roomPath}/state`);

    queryTimerStatus.on("value", onChangeTimerStatus);
    queryState.on("value", onChangeState);

    return () => {
      queryTimerStatus.off("value", onChangeTimerStatus);
      queryState.off("value", onChangeState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  const [updatingTeamName, toggleTeamName] = useState(false);

  const incrementTimer = () => {
    updateRoomSettings({
      timer: room.settings.timer + 60 * 1000,
    });
  };

  const decrementTimer = () => {
    const nextVal = room.settings.timer - 60 * 1000;
    if (Math.floor(nextVal / 1000) < 1) return;

    updateRoomSettings({ timer: nextVal });
  };

  const setTimer = (value) => {
    if (value < 1) return;
    updateRoomSettings({
      timer: Number(value) * (1000 * 60),
    });
  };

  const decrementBreaks = () => {
    const nextVal = room.settings.breakLength - 60 * 1000;
    if (Math.floor(nextVal / 1000) < 1) return;
    updateRoomSettings({ breakLength: nextVal });
  };

  const incrementBreaks = () => {
    const newBreakLength = room.settings.breakLength + 60 * 1000;
    updateRoomSettings({ breakLength: newBreakLength });
  };

  const updateBreak = (value) => {
    if (value < 1) return;
    const newBreakLength = Number(value) * (1000 * 60);
    updateRoomSettings({ breakLength: newBreakLength });
  };

  const decrementBreakInterval = () => {
    const nextVal = room.settings.breakInterval - 1;
    if (Math.floor(nextVal) < 1) return;
    updateRoomSettings({ breakInterval: nextVal });
  };

  const incrementBreakInterval = () => {
    updateRoomSettings({
      breakInterval: room.settings.breakInterval + 1,
    });
  };

  const updateBreakInterval = (value) => {
    if (value < 1) return;
    updateRoomSettings({ breakInterval: Number(value) });
  };

  const setNewMobState = () => {
    startSession(true);
  };

  const timerDone = () => {
    stopSession();
  };

  const getNextStateStr = () => {
    if (!nextTypist.name) return null;
    const { nextState } = room;
    return nextState === ROOM_STATES.BREAK
      ? "Next: Coffee Break"
      : `Next: ${nextTypist.name}`;
  };

  if (!room) {
    return (
      <Container className="h-100 d-flex  align-items-center justify-content-center">
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  const minutesPerTurn = room.settings.timer / (60 * 1000);
  const breakLength = room.settings.breakLength / (60 * 1000);
  const { breakInterval } = room.settings;
  const idleTimerValue = room.timeLeft || room.settings.timer;

  const isTimerRunning = isRunning();
  const currentTypist = getTypist();
  const nextStateStr = getNextStateStr();
  const breakIn = getBreakIn();
  const isTimerRunningOrPaused =
    isTimerRunning || room.timerStatus === TIMER_STATUS.PAUSED;
  const isTimerRunningOrPausedNotBreak =
    isTimerRunningOrPaused && room.state !== ROOM_STATES.BREAK;
  return (
    <>
      <ThemeSelector />
      <Container className="mb-5">
        <Row>
          <Col>
            {!updatingTeamName ? (
              <h1
                className="themed"
                onClick={() => toggleTeamName(true)}
                onKeyDown={() => {}}
              >
                {room.name}
              </h1>
            ) : (
              <h1>
                <InputOnEnter
                  border={false}
                  onBlur
                  autoFocus
                  placeholder="Room Name"
                  disabled={updatingTeamName}
                  defaultValue={room.name}
                  onEnter={(name) => {
                    toggleTeamName(false);
                    if (name !== "") {
                      updateRoomName(name);
                    }
                  }}
                />
              </h1>
            )}
          </Col>
        </Row>
        <Row className="align-items-center">
          <Col md={1}>Active</Col>

          <ParticipantList
            variant="primary"
            participants={room.activeParticipants}
            onSelect={updateTypist}
            onRemove={removeFromActiveParticipants}
          />

          <Col xs={12} md className="my-2">
            <Row className="justify-content-end ">
              <Col md="auto">
                <Button
                  block
                  onClick={shuffleParticipants}
                  variant="outline-primary"
                >
                  Shuffle
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="mt-2 align-items-center">
          <Col md={1}>Inactive</Col>
          <ParticipantList
            variant="secondary"
            participants={room.inactiveParticipants}
            onSelect={moveFromInactiveToActive}
            onRemove={removePerson}
          />
        </Row>
        <Row className="my-4">
          <Col>
            <InputOnEnter placeholder="Add Person" onEnter={addPerson} />
          </Col>
        </Row>
        <Row className="mt-2 align-items-center">
          <Col xs={12} md={6}>
            <Row className="justify-content-end text-center">
              <Col md="auto pr-1"> Mob timer </Col>
            </Row>
          </Col>
          <Col xs={12} md={6}>
            <Row className="justify-content-start align-items-center">
              <Col md="auto px-md-1">
                <AddSubInput
                  decrementCb={decrementTimer}
                  incrementCb={incrementTimer}
                  inputValue={minutesPerTurn}
                  updateInput={setTimer}
                />
              </Col>
              <Col xs={12} className="text-center px-md-1" md="auto">
                minutes
              </Col>
            </Row>
          </Col>
        </Row>
        <Row
          className="mt-2 align-items-center"
          style={{ textAlign: "center" }}
        >
          <Col xs={12} md={6}>
            <Row className="justify-content-end">
              <Col md="auto pr-1"> Break after </Col>
            </Row>
          </Col>
          <Col xs={12} md={6}>
            <Row className="justify-content-start align-items-center">
              <Col md="auto px-md-1">
                <AddSubInput
                  decrementCb={decrementBreakInterval}
                  incrementCb={incrementBreakInterval}
                  inputValue={breakInterval}
                  updateInput={updateBreakInterval}
                />
              </Col>
              <Col
                xs={12}
                md="auto"
                className="flex px-md-1 justify-content-center"
              >
                <span>typists ({breakInterval * minutesPerTurn} minutes)</span>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="mt-2 align-items-center">
          <Col xs={12} md={6}>
            <Row className="justify-content-end text-center">
              <Col md="auto pr-1"> Coffee break </Col>
            </Row>
          </Col>
          <Col xs={12} md={6}>
            <Row className="justify-content-start align-items-center">
              <Col md="auto px-md-1">
                <AddSubInput
                  decrementCb={decrementBreaks}
                  incrementCb={incrementBreaks}
                  inputValue={breakLength}
                  updateInput={updateBreak}
                />
              </Col>

              <Col xs={12} className="text-center px-md-1" md="auto">
                minutes
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="mt-2 justify-content-center">
          <Col xs="auto">
            <div style={{ fontSize: "50px" }}>
              {room.state === ROOM_STATES.BREAK
                ? "Coffee Break!"
                : currentTypist && currentTypist.name}
            </div>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col>
            <Timer
              isRunning={isTimerRunning}
              idleValue={idleTimerValue}
              timerDoneCb={() => timerDone()}
              timerEndsAt={room.currentStateEnds}
            />
          </Col>
        </Row>
        <Row className="my-1" style={{ height: "40px" }}>
          <Col className="text-center">{nextStateStr}</Col>
          {isTimerRunningOrPausedNotBreak && breakIn > 1 && (
            <Col className="text-center">
              Coffee break after {breakIn} more typist(s)
            </Col>
          )}
        </Row>
        {!isTimerRunning ? (
          <Row className="mt-2">
            <Col>
              <Button
                disabled={isTimerRunning || room.activeParticipants.length < 1}
                onClick={() => startSession()}
                variant="outline-primary"
                block
              >
                {room.timerStatus === TIMER_STATUS.PAUSED
                  ? "Continue"
                  : "Start Session"}
              </Button>
            </Col>
          </Row>
        ) : (
          <Row className="mt-2">
            <Col>
              <Button onClick={pauseSession} variant="outline-warning" block>
                Pause
              </Button>
            </Col>
          </Row>
        )}
        {isTimerRunningOrPaused && (
          <Row className="mt-2">
            <Col>
              <Button variant="outline-danger" onClick={resetSession} block>
                Reset Mob Session
              </Button>
            </Col>
          </Row>
        )}
        <VerticallyCenteredModal
          show={modalState.shouldShow}
          message={modalState.message}
          onHide={() => {
            dispatchModal({ type: "hide" });
            setNewMobState();
          }}
        />
      </Container>
    </>
  );
};

_Room.propTypes = {
  sendNotification: PropTypes.func.isRequired,
};

const Room = withNotification(memo(_Room));
export { Room };
