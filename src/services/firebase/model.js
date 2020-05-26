export const ROOM_STATES = {
  BREAK: "BREAK",
  NORMAL: "NORMAL",
  IDLE: "IDLE",
};

export const TIMER_STATUS = {
  RUNNING: "RUNNING",
  PAUSED: "PAUSED",
  NOT_STARTED: "NOT_STARTED",
};

const SAMPLE_ROOM = {
  name: "GIVE YOUR TEAM A NAME",
  currentStateEnds: null,
  state: ROOM_STATES.NORMAL,
  timerStatus: TIMER_STATUS.NOT_STARTED,
  iterations: 0,
  settings: {
    timer: 600 * 1000,
    breakLength: 300 * 1000,
    breakInterval: 4,
  },
  activeParticipants: [],
  inactiveParticipants: [],
};

const greekLetters = [
  { sign: "α", abbr: "alpha" },

  { sign: "ι", abbr: "iota" },

  { sign: "ρ", abbr: "rho" },

  {
    sign: "β",
    abbr: "beta",
  },
  { sign: "κ", abbr: "kappa" },
  { sign: "σ", abbr: "sigma" },
  { sign: "γ", abbr: "gamma" },
  { sign: "λ", abbr: "lambda" },
  { sign: "τ", abbr: "tau" },
  { sign: "δ", abbr: "delta" },
  { sign: "μ", abbr: "mu" },
  { sign: "υ", abbr: "upsilon" },

  { sign: "ε", abbr: "epsilon" },
  { sign: "ν", abbr: "nu" },
  { sign: "φ", abbr: "phi" },

  { sign: "ζ", abbr: "zeta" },
  { sign: "ξ", abbr: "xi" },
  { sign: "χ", abbr: "chi" },

  { sign: "η", abbr: "eta" },
  { sign: "ο", abbr: "omicron" },
  { sign: "ψ", abbr: "psi" },

  { sign: "θ", abbr: "theta" },
  { sign: "π", abbr: "pi" },
  { sign: "ω", abbr: "omega" },
];

const getAndRemove = (letters) => {
  const index = Math.floor(letters.length * Math.random());
  const letter = letters[index];
  letters.splice(index, 1);
  return letter.abbr.charAt(0).toUpperCase() + letter.abbr.slice(1);
};

const generateName = () => {
  const letters = greekLetters;
  return `${getAndRemove(letters)} ${getAndRemove(letters)} ${getAndRemove(
    letters
  )}`;
};
export const generateSampleRoom = () => {
  return {
    mob: { ...SAMPLE_ROOM, name: generateName() },
  };
};
