import mongoose from 'mongoose';

//criacao do modelo
const bank = mongoose.Schema({
  agencia: {
    type: Number,
    require: true,
  },
  conta: {
    type: Number,
    require: true,
  },
  name: {
    type: String,
    require: true,
  },
  balance: {
    type: Number,
    require: true,
    validade(value) {
      if (value < 0) throw new Error('Valor negativo para nota, não permitido');
    },
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});

const myBankModel = mongoose.model('bank', bank, 'bank');
export { myBankModel };
