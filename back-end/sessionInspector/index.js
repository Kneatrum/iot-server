const { sessionStoreReady, getSessionStore } = require('./sessionManager');

let sessionStore = null;
let SessionModel = null;

// Initialize sessionStore once when module is loaded
(async () => {
  await sessionStoreReady;
  sessionStore = getSessionStore();

  if (!sessionStore || !sessionStore.model) {
    console.error('Session store is not properly initialized or missing model');
    return;
  }

  SessionModel = sessionStore.model;
})();

async function listAllSessions() {
  if (!SessionModel) {
    throw new Error('SessionModel not initialized yet');
  }

  const sessions = await SessionModel.findAll();

  return sessions.map((session) => {
    let parsedSession = {};
    try {
      parsedSession = JSON.parse(session.data);
    } catch (e) {
      console.warn(`Failed to parse session data for session ${session.sid}`);
    }

    return {
      sessionID: session.sid,
      user: parsedSession?.user || parsedSession?.passport?.user || 'unknown',
      expires: session.expires,
      rawData: parsedSession,
    };
  });
}

async function getSessionByID(sid) {
  if (!SessionModel) {
    throw new Error('SessionModel not initialized yet');
  }

  const session = await SessionModel.findOne({ where: { sid } });
  if (!session) return null;

  try {
    return {
      sessionID: session.sid,
      data: JSON.parse(session.data),
      expires: session.expires,
    };
  } catch (e) {
    console.warn(`Failed to parse session data for session ${sid}`);
    return { sessionID: session.sid, data: null, expires: session.expires };
  }
}

async function deleteSessionByID(sid) {
  if (!SessionModel) {
    throw new Error('SessionModel not initialized yet');
  }

  const deletedCount = await SessionModel.destroy({ where: { sid } });
  return deletedCount > 0;
}

module.exports = {
  listAllSessions,
  getSessionByID,
  deleteSessionByID,
};
