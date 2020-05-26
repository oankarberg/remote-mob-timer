import "firebase/firestore"; // For timestamp
import firebase from "firebase/app";
import { generatePerson } from "../../components/CreateRoom";
import { TIMER_STATUS, ROOM_STATES } from "./model";

const trimString = (str) => {
  return str ? str.trim() : str;
};

export const findTypistIndex = (participants) => {
  const ps = participants || [];
  return ps.findIndex((person) => {
    return person.typist;
  });
};
export const findNextTypistIndex = (participants) => {
  const numParticipants = participants.length;
  const currentTypistIndex = findTypistIndex(participants);

  if (currentTypistIndex < 0) {
    return 0;
  }
  if (currentTypistIndex >= numParticipants - 1) {
    return 0;
  }
  return currentTypistIndex + 1;
};

export const findNextTypist = (participants) => {
  const numParticipants = participants.length;
  if (numParticipants < 1) return {};
  return participants[findNextTypistIndex(participants)];
};

const getNewNextState = (iterations, breakInterval) => {
  const untilNextStateIsBreak = (iterations + 1) % (breakInterval + 1);
  if (untilNextStateIsBreak === 0) {
    return ROOM_STATES.BREAK;
  }

  return ROOM_STATES.NORMAL;
};

const setNewTypistAt = (participants, newTypistIndex) =>
  participants.map((p, i) => {
    let typist = false;
    if (newTypistIndex === i) {
      typist = true;
    }
    return { ...p, typist };
  });

const changeToNextTypist = (participants) => {
  const newTypistIndex = findNextTypistIndex(participants);
  return setNewTypistAt(participants, newTypistIndex);
};

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

export const useFirebaseForRoom = (room, roomPath) => {
  const updateParticipants = (activeParticipants, inactiveParticipants) =>
    firebase.update(roomPath, {
      activeParticipants,
      inactiveParticipants,
    });

  const continueRunning = () => {
    const timeLeft = room.timeLeft - 1000;
    firebase.update(roomPath, {
      currentStateEnds:
        firebase.firestore.Timestamp.now().seconds * 1000 + timeLeft,
      timeLeft: null,
      timerStatus: TIMER_STATUS.RUNNING,
    });
  };

  const getTypist = () => {
    const participants = room.activeParticipants;
    const index = findTypistIndex(participants);
    if (index < 0) return {};
    return participants[index];
  };

  const getNextTypist = () => {
    if (!room) return {};
    return findNextTypist(room.activeParticipants);
  };

  const shuffleParticipants = () => {
    const { activeParticipants } = room;
    if (activeParticipants.length < 1) return null;
    const currTypist = getTypist();
    shuffle(activeParticipants);
    currTypist.typist = false;
    activeParticipants[0].typist = true;
    return firebase.update(roomPath, {
      activeParticipants,
    });
  };

  const isRunning = () => {
    const { timerStatus } = room;
    if (timerStatus === TIMER_STATUS.RUNNING) return true;
    if (timerStatus === TIMER_STATUS.NOT_STARTED) return false;
    if (timerStatus === TIMER_STATUS.PAUSED) return false;
    return false;
  };
  return {
    addPerson: (name) => {
      const person = generatePerson(trimString(name));
      if (room.activeParticipants.length < 1) person.typist = true;

      room.activeParticipants.push(person);
      firebase.update(roomPath, {
        activeParticipants: room.activeParticipants,
      });
    },
    updateRoomName: (roomName) =>
      firebase.update(roomPath, {
        name: trimString(roomName),
      }),
    updateParticipants,
    shuffleParticipants,
    removeFromActiveParticipants: (participants, index) => {
      const participant = participants[index];
      let activeParticipants = participants;
      if (participant.typist) {
        activeParticipants = changeToNextTypist(activeParticipants);
        participant.typist = false;
      }

      activeParticipants.splice(index, 1);
      room.inactiveParticipants.push(participant);
      return updateParticipants(activeParticipants, room.inactiveParticipants);
    },
    getActiveParticipantsValue: () =>
      firebase
        .database()
        .ref()
        .child(`${roomPath}/activeParticipants`)
        .once("value", (_snap) => _snap),
    updateRoomSettings: (updatedSettings) =>
      firebase.update(roomPath, {
        settings: { ...room.settings, ...updatedSettings },
        nextState: getNewNextState(
          room.iterations,
          room.settings.breakInterval
        ),
      }),
    getTypist,
    getNextTypist,
    getBreakIn: () => {
      return (
        room.settings.breakInterval +
        1 -
        (room.iterations % (room.settings.breakInterval + 1))
      );
    },
    isRunning,
    moveFromInactiveToActive: (inactiveParticipants, index, participant) => {
      const p = getTypist(room.activeParticipants);
      if (!p.name) {
        participant.typist = true;
      }

      room.activeParticipants.push(participant);
      inactiveParticipants.splice(index, 1);
      return updateParticipants(room.activeParticipants, inactiveParticipants);
    },
    removePerson: (inactiveParticipants, index) => {
      inactiveParticipants.splice(index, 1);
      firebase.update(roomPath, {
        inactiveParticipants,
      });
    },
    pauseSession: () => {
      if (!isRunning(room.timerStatus)) return;
      firebase.update(roomPath, {
        timeLeft:
          room.currentStateEnds -
          firebase.firestore.Timestamp.now().seconds * 1000,
        timerStatus: TIMER_STATUS.PAUSED,
      });
    },
    continueRunning,
    resetSession: () => {
      firebase.update(roomPath, {
        timeLeft: null,
        timerStatus: TIMER_STATUS.NOT_STARTED,
        state: ROOM_STATES.NORMAL,
        nextState: getNewNextState(0, room.settings.breakInterval),
        iterations: 0,
      });
    },

    updateTypist: (participants, index) => {
      firebase.update(roomPath, {
        activeParticipants: setNewTypistAt(participants, index),
        nextState: getNewNextState(
          room.iterations,
          room.settings.breakInterval
        ),
      });
    },
    stopSession: () => {
      firebase.update(roomPath, {
        timeLeft: null,
        timerStatus: TIMER_STATUS.NOT_STARTED,
        state: ROOM_STATES.IDLE,
        idle: true,
      });
    },
    startSession: (changeTypist = false) => {
      if (room.timerStatus === TIMER_STATUS.PAUSED) return continueRunning();

      const newState = room.nextState || ROOM_STATES.NORMAL;

      const initTimerLength =
        // Start Timer with the Break Timer or Defaul mob timer
        newState === ROOM_STATES.BREAK
          ? room.settings.breakLength
          : room.settings.timer;

      if (newState !== ROOM_STATES.BREAK && changeTypist) {
        room.activeParticipants = changeToNextTypist(room.activeParticipants);
      }
      const roomIterations = (room.iterations || 0) + 1;
      const newNextState = getNewNextState(
        roomIterations,
        room.settings.breakInterval
      );

      return firebase.update(roomPath, {
        currentStateEnds:
          firebase.firestore.Timestamp.now().seconds * 1000 + initTimerLength,
        timeLeft: null,
        iterations: roomIterations,
        activeParticipants: room.activeParticipants,
        timerStatus: TIMER_STATUS.RUNNING,
        idle: false,
        state: newState,
        nextState: newNextState,
      });
    },
  };
};
