const {
  BOT_NAME,
  getPublicAssistantReply,
  streamPublicAssistantReply,
} = require('../services/publicAiAssistantService');

const canExposeDebug = () => process.env.NODE_ENV !== 'production';

const writeSseEvent = (res, event, payload) => {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

const publicChat = async (req, res, next) => {
  try {
    const result = await getPublicAssistantReply({
      message: req.body.message,
      history: req.body.history,
    });

    const payload = {
      bot: BOT_NAME,
      reply: result.reply,
      source: result.source,
      provider: result.provider,
      model: result.model,
    };

    if (result.policy) {
      payload.policy = result.policy;
    }

    if (canExposeDebug() && result.debug) {
      payload.debug = result.debug;
    }

    res.json(payload);
  } catch (error) {
    next(error);
  }
};

const publicChatStream = async (req, res, next) => {
  const clientAbortController = new AbortController();

  res.on('close', () => {
    if (!res.writableEnded) {
      clientAbortController.abort();
    }
  });

  try {
    res.status(200);
    res.set({
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection:      'keep-alive',
    });
    res.flushHeaders?.();

    writeSseEvent(res, 'meta', {
      bot: BOT_NAME,
    });

    const result = await streamPublicAssistantReply({
      message: req.body.message,
      history: req.body.history,
      signal:  clientAbortController.signal,
      onDelta: (delta) => {
        writeSseEvent(res, 'delta', { delta });
      },
    });

    const payload = {
      bot: BOT_NAME,
      source: result.source,
      provider: result.provider,
      model: result.model,
      policy: result.policy,
    };

    if (canExposeDebug() && result.debug) {
      payload.debug = result.debug;
    }

    writeSseEvent(res, 'done', payload);
    res.end();
  } catch (error) {
    if (clientAbortController.signal.aborted) {
      return;
    }

    if (res.headersSent) {
      writeSseEvent(res, 'error', {
        error: 'Veteran Assistant could not complete the response.',
      });
      return res.end();
    }

    next(error);
  }
};

module.exports = {
  publicChat,
  publicChatStream,
};
