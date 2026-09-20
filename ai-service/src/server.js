import "dotenv/config";

import app from "./app.js";

const PORT = Number(process.env.PORT) || 4100;

app.listen(PORT, () => {
    console.log(
        `Quantum Care AI running on http://localhost:${PORT}`
    );
});