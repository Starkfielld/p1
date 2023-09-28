const mysql = require("mysql2/promise");

const client = mysql.createPool(process.env.CONNECTION_STRING);

 async function listarClientes() {
    const results = await client.query("select * from clientes;");
    return results[0];
}
async function selecioneCliente(id) {
    const results = await client.query("select * from clientes where id=?;", [id]);
    return  results[0]
}

function inserirCliente(cliente){
    clientes.push(cliente)
}

function atualizarCliente(id, clienteNovo){
    const customer = clientes.find(c => c.id === id);
    if(!customer) return;
    customer.nome = clienteNovo.nome;
    customer.idade = clienteNovo.idade;
    customer.uf = clienteNovo.uf;
}

function deleteCliente(id){
    const index = clientes.findIndex(c => c.id === id);
    clientes.splice(index, 1);
}

module.exports={
    listarClientes,
    selecioneCliente,
    inserirCliente,
    atualizarCliente,
    deleteCliente
}