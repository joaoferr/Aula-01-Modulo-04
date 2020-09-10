require('dotenv').config();
import express from 'express';
import { myBankRouter } from './routes/myBankRouter.js';
import mongoose from 'mongoose';

(async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.USERDB}:${process.env.PASSWD}@cluster0.y9ooy.gcp.mongodb.net/myBank?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
  } catch (error) {
    console.log('Erro ao conectar no MongoDB');
  }
})();

const app = express();
app.use(express.json());
app.use(myBankRouter);
app.listen(3000, () => console.log('API online'));

//mongoimport --uri "mongodb+srv://grades:123@cluster0.y9ooy.gcp.mongodb.net/grades?retryWrites=true&w=majority" --collection grades --jsonArray --file accounts.json
