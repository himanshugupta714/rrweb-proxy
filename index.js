const express = require("express");
const fetch = require("node-fetch");
const app = express();
const PORT = 3001;

app.use(express.static("public"));

app.get("/proxy", async (req, res) => {
  const targetURL = req.query.url;

  if (!targetURL) {
    return res.status(400).send("URL is required");
  }

  try {
    const response = await fetch(targetURL);
    const html = await response.text();

    const modifiedHtml = html.replace(
      "</body>",
      `<script src="/rrweb.js"></script>
      <script>
      rrweb.record({
        emit(event) {
            // Send the event to the parent window
            window.parent.postMessage({ type: 'RRWEB_EVENT', event: event }, '*');
        }
      });
      </script>
      <script src="/rrwebInit.js"></script>
      </body>`
    );

    res.send(modifiedHtml);
  } catch (error) {
    res.status(500).send("Failed to fetch and modify content.");
  }
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
