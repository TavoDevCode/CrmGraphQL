const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected database ☁️');
    } catch (error) {
        console.log('Problems connecting to database 💔');
        console.log(error);
        process.exit(1);
    }
};

module.exports = connectDB;
