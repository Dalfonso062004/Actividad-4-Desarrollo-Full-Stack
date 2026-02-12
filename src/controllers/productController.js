const Product = require('../models/Product');
const AppError = require('../utils/appError');

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ user: req.user.id });
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!product) {
      return next(new AppError('Producto no encontrado', 404));
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!product) {
      return next(new AppError('Producto no encontrado', 404));
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!product) {
      return next(new AppError('Producto no encontrado', 404));
    }

    await product.remove();

    res.status(200).json({
      success: true,
      message: 'Producto eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};