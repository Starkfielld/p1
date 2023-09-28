require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const port  = 3000

const db = require("./database");

const app = express();
app.use(express.json());


const User = require("./models/User");

app.patch("/clientes/:id", (request, response)=>{
  const id = parseInt(request.params.id);
  const cliente = request.body;
  db.atualizarCliente(id, cliente);
  response.sendStatus(200)
})
app.delete("/clientes/:id", (request, response)=>{
  const id = parseInt(request.params.id);
  db.deleteCliente(id);
  response.sendStatus(204);
})
app.post("/clientes", (request, response)=>{
    const cliente = request.body;
    db.inserirCliente(cliente);
    response.sendStatus(201)
})

app.get("/clientes", async (request, response) =>{
  const resultados = await db.listarClientes();
  response.json(resultados);
})

app.get("/clientes/:id", async (request, response)=>{
  const id = parseInt(request.params.id);
  const resultado = await db.selecioneCliente(id);
  response.json(resultado);
})

app.get("/", (req, res) => {
  res.send("Bem vindo a API!" );
});


app.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;


  const user = await User.findById(id, "-password");

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado!" });
  }

  res.status(200).json({ user });
});

function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "Acesso negado!" });

  try {
    const secret = process.env.SECRET;

    jwt.verify(token, secret);

    next();
  } catch (err) {
    res.status(400).json({ msg: "O Token é inválido!" });
  }
}

app.post("/auth/register", async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;


  if (!name) {
    return res.status(422).json({ msg: "O nome é obrigatório!" });
  }

  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }

  if (password != confirmpassword) {
    return res
      .status(422)
      .json({ msg: "A senha e a confirmação precisam ser iguais!" });
  }

  const userExists = await User.findOne({ email: email });

  if (userExists) {
    return res.status(422).json({ msg: "Por favor, utilize outro e-mail!" });
  }


  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);


  const user = new User({
    name,
    email,
    password: passwordHash,
  });

  try {
    await user.save();

    res.status(201).json({ msg: "Usuário criado com sucesso!" });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }


  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado!" });
  }


  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ msg: "Senha inválida" });
  }

  try {
    const secret = process.env.SECRET;

    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );

    res.status(200).json({ msg: "Autenticação realizada com sucesso!", token });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
});


const dbuser = process.env.DB_USER
const dbpass = process.env.DB_PASS
mongoose.connect(`mongodb+srv://${dbuser}:${dbpass}@cluster0.xhivsbi.mongodb.net/?retryWrites=true&w=majority`
).then(()=>{
  app.listen(port, ()=>{
    console.log(`App rodando na porta: ${port}`)
  })
})
.catch((err) => console.log(err))