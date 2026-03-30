// backend/routes/sse.route.js
const express = require("express");
const router = express.Router();
const sseBus = require("../utils/sseBus");

router.get("/sse/:sessionId", (req, res) => {
    const { sessionId } = req.params;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const sendEvent = (data) => {
        // const eventType = data.type || "message";
        // res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
        const { type, ...payload } = data;
        //console.log("📤 Enviado SSE:", type, payload);
        res.write(`event: ${type || "message"}\n`);
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    sseBus.on(sessionId, sendEvent);

    req.on("close", () => {
        sseBus.off(sessionId, sendEvent);
    });
});

module.exports = router;
