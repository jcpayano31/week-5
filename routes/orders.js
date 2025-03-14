const { Router } = require('express');
const router = Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const errorHandler = require('../middleware/error');
const orderDAO = require('../daos/orders');
const userDAO = require('../daos/user');
const itemDAO = require('../daos/items');


//create order
router.post('/', async (req, res, next) => {
  try {
    const order = {
      userId: req.user._id,
      items: req.body,
    };

    const createdNewOrder = await orderDAO.createOrder(order);
    res.json(createdNewOrder);
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await orderDAO.getOrderById(req.params.id);
    const user = await userDAO.getUserById(req.user._id);

    if (order) {
      if (
        order.userId.toString() === user._id.toString() ||
        user.roles.includes('admin')
      ) {
        res.json(order);
      } else {
        throw new Error('Unauthorized');
      }
    } else {
      throw new Error(`Order ${req.params.id} not found`);
    }
  } catch (e) {
    next(e);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const orders = req.user.roles.includes('admin')
      ? await orderDAO.getAllOrders()
      : await orderDAO.getUserOrders(req.user._id);

    if (orders) {
      res.json(orders);
    } else {
      throw new Error(`No orders for user ${req.user._id}`);
    }
  } catch (e) {
    next(e);
  }
});

router.use(errorHandler);

module.exports = router; 