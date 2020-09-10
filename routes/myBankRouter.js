import express from 'express';
import { myBankModel } from '../models/myBank.js';

const app = express();

app.get('/excluir', async (rec, res) => {
  const query = {
    $and: [
      { agencia: { $eq: rec.body.agencia } },
      { conta: { $eq: rec.body.conta } },
    ],
  };

  try {
    const banco = await myBankModel.deleteOne(query);
    const agencia = parseInt(rec.body.agencia);
    const conta = await myBankModel.find({ agencia: agencia }).count();
    res.send(JSON.stringify(conta));
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/saldo', async (rec, res) => {
  try {
    const banco = await myBankModel.findOne({
      $and: [
        { agencia: { $eq: rec.body.agencia } },
        { conta: { $eq: rec.body.conta } },
      ],
    });
    res.send(banco);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/criaConta', async (rec, res) => {
  const conta = new myBankModel({
    agencia: rec.body.agencia,
    conta: rec.body.conta,
    name: rec.body.name,
    balance: rec.body.balance,
  });

  try {
    const data = await conta.save(conta);
    res.send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/deposito', async (rec, res) => {
  const query = {
    $and: [
      { agencia: { $eq: rec.body.agencia } },
      { conta: { $eq: rec.body.conta } },
    ],
  };
  const projection = {
    _id: 0,
    balance: 1,
  };

  try {
    const banco = await myBankModel.findOne(query, projection);
    const saldoBanco = JSON.stringify(banco.balance);
    const deposito = rec.body.balance;
    const saldo = parseFloat(saldoBanco) + parseFloat(deposito);

    const bancoUp = await myBankModel.update(query, { balance: saldo });
    const bancoAfter = await myBankModel.findOne(query, projection);
    res.send(bancoAfter);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/saque', async (rec, res) => {
  const query = {
    $and: [
      { agencia: { $eq: rec.body.agencia } },
      { conta: { $eq: rec.body.conta } },
    ],
  };
  const projection = {
    _id: 0,
    balance: 1,
  };

  try {
    const banco = await myBankModel.findOne(query, projection);
    const saldoBanco = JSON.stringify(banco.balance);
    const deposito = rec.body.balance;
    const saldo = parseFloat(saldoBanco) - parseFloat(deposito) - parseFloat(1);
    const bancoUp = await myBankModel.update(query, { balance: saldo });
    const bancoAfter = await myBankModel.findOne(query, projection);
    res.send(bancoAfter);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/transferencia', async (rec, res) => {
  const queryOrigem = {
    $and: [{ conta: { $eq: rec.body.ctOrigem } }],
  };
  const queryDestino = {
    $and: [{ conta: { $eq: rec.body.ctDestino } }],
  };

  const projection = {
    _id: 0,
    agencia: 1,
    balance: 1,
  };

  try {
    const contaOrigem = await myBankModel.findOne(queryOrigem, projection);
    const contaDestino = await myBankModel.findOne(queryDestino, projection);

    const saldoOrigem = JSON.stringify(contaOrigem.balance);
    const saldoDestino = JSON.stringify(contaDestino.balance);
    const agOrigem = JSON.stringify(contaOrigem.agencia);
    const agDestino = JSON.stringify(contaDestino.agencia);
    const valorTransferencia = rec.body.valorTranferencia;

    if (agOrigem !== agDestino) {
      const novoSaldoOrigem =
        parseFloat(saldoOrigem) -
        parseFloat(8) -
        parseFloat(valorTransferencia);

      const novoSaldodestino =
        parseFloat(saldoDestino) + parseFloat(valorTransferencia);

      await myBankModel.update(queryOrigem, { balance: novoSaldoOrigem });
      await myBankModel.update(queryDestino, { balance: novoSaldodestino });
    } else {
      const novoSaldoOrigem =
        parseFloat(saldoOrigem) - parseFloat(valorTransferencia);

      const novoSaldodestino =
        parseFloat(saldoDestino) + parseFloat(valorTransferencia);

      await myBankModel.update(queryOrigem, { balance: novoSaldoOrigem });
      await myBankModel.update(queryDestino, { balance: novoSaldodestino });
    }

    const bancoAfter = await myBankModel.findOne(queryOrigem, projection);
    res.send(bancoAfter);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/media', async (rec, res) => {
  try {
    const agencia = parseInt(rec.body.agencia);

    const match = { $match: { agencia: { $eq: agencia } } };
    const aggr = { $group: { _id: '$agencia', media: { $avg: '$balance' } } };
    const media = await myBankModel.aggregate([match, aggr]);
    res.send(JSON.stringify(media));
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/menor', async (rec, res) => {
  try {
    const qtd = parseInt(rec.body.qtd);
    const menor = await myBankModel.find().limit(qtd).sort({ balance: 1 });
    res.send(JSON.stringify(menor));
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/maior', async (rec, res) => {
  try {
    const qtd = parseInt(rec.body.qtd);
    const maior = await myBankModel.find().limit(qtd).sort({ balance: -1 });
    res.send(JSON.stringify(maior));
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/private', async (rec, res) => {
  try {
    const agencias = await myBankModel.distinct('agencia').exec();
    const contaPrivada = [];
    const agenciaPrivada = 99;
    for (let agencia of agencias) {
      const contas = await myBankModel
        .findOneAndUpdate(
          { agencia: agencia },
          { $set: { agencia: agenciaPrivada } },
          { new: true }
        )
        .sort({ balance: -1 });
      contaPrivada.push(contas);
    }
    res.send(JSON.stringify(contaPrivada));
  } catch (error) {
    res.status(500).send(error);
  }
});

export { app as myBankRouter };
