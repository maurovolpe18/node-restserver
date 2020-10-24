const express = require("express");

let { verificaToken } = require("../middlewares/auth");
const producto = require("../models/producto");

let app = express();

let Producto = require("../models/producto");

//Obtener todos los productos
app.get("/producto", verificaToken, (req, res) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);

  let limite = req.query.limite || 5;
  limite = Number(limite);

  Producto.find({ disponible: true })
    .skip(desde)
    .limit(limite)
    .sort("nombre")
    .populate("usuario", "nombre email")
    .populate("categoria", "descripcion")
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        productos,
      });
    });
});

//Obtener producto por id
app.get("/producto/:id", verificaToken, (req, res) => {
  let id = req.params.id;
  Producto.findById(id)
    .populate("usuario", "nombre email")
    .populate("categoria", "descripcion")
    .exec((err, productoDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }
      if (!productoDB) {
        return res.status(500).json({
          ok: false,
          err: {
            message: "El id no es válido",
          },
        });
      }

      res.json({
        ok: true,
        productoDB,
      });
    });
});

//Buscar Productos

app.get("/producto/buscar/:termino", verificaToken, (req, res) => {
  let termino = req.params.termino;
  let regex = new RegExp(termino, "i");

  Producto.find({ nombre: regex })
    .populate("usuario", "nombre email")
    .populate("categoria", "descripcion")
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }
      res.json({
        ok: true,
        productos,
      });
    });
});

//Crear Producto
app.post("/producto", verificaToken, (req, res) => {
  let body = req.body;
  let producto = new Producto({
    usuario: req.usuario._id,
    nombre: body.nombre,
    precioUni: body.precioUni,
    descripcion: body.descripcion,
    disponible: body.disponible,
    categoria: body.categoria,
  });

  producto.save((err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }
    if (!productoDB) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      productoDB,
    });
  });
});

//Actualizar producto
app.put("/producto/:id", verificaToken, (req, res) => {
  let id = req.params.id;
  let body = req.body;

  Producto.findById(id, (err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }
    if (!productoDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "El ID no existe",
        },
      });
    }

    productoDB.nombre = body.nombre;
    productoDB.precioUni = body.precioUni;
    productoDB.descripcion = body.descripcion;
    productoDB.disponibl = body.disponibl;
    productoDB.categoria = body.categoria;

    productoDB.save((err, productoGuardado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }
      res.json({
        ok: true,
        producto: productoGuardado,
      });
    });
  });
});

//Eliminar Producto
app.delete("/producto/:id", verificaToken, (req, res) => {
  let id = req.params.id;
  Producto.findById(id, (err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }
    if (!productoDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "El ID no existe",
        },
      });
    }

    productoDB.disponible = false;

    productoDB.save((err, productoBorrado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        productoBorrado,
        message: "Producto eliminado",
      });
    });
  });
});

module.exports = app;
