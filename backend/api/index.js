// api/index.js
import app from "../src/app.js";
import connectDB from "../src/Db/index.js";

// Vercel doesn't use app.listen(). 
// It invokes this function on every request.
const handler = async (req, res) => {
    try {
        await connectDB();
        return app(req, res);
    } catch (error) {
        res.status(500).send("Database connection error");
    }
};

export default handler;