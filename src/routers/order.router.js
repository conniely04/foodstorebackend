// routes/orderRouter.js
import { Router } from "express";
import { OrderModel } from "../models/order.model.js";
import { BAD_REQUEST } from "../constants/httpStatus.js";
import validateJwt from "../middleware/auth.js";
import handler from "express-async-handler";
import { OrderStatus } from "../constants/orderStatus.js";
import { UserModel } from "../models/user.model.js";

const router = Router();
router.use(validateJwt);

router.get(
  "/",
  validateJwt,
  handler(async (req, res) => {
    const orders = await OrderModel.find({});
    res.send(orders);
  })
);

router.post(
  "/create",
  handler(async (req, res) => {
    const order = req.body;

    if (order.items.length <= 0) res.status(BAD_REQUEST).send("Cart Is Empty!");

    await OrderModel.deleteOne({
      user: req.user.id,
      status: OrderStatus.NEW,
    });

    const newOrder = new OrderModel({ ...order, user: req.user.id });
    await newOrder.save();
    res.send(newOrder);
  })
);

router.put(
  "/pay",
  handler(async (req, res) => {
    const { paymentId } = req.body;
    const order = await getNewOrderForCurrentUser(req);
    if (!order) {
      res.status(BAD_REQUEST).send("Order Not Found!");
      return;
    }

    order.paymentId = paymentId;
    order.status = OrderStatus.PAYED;
    await order.save();

    res.send(order._id);
  })
);

export default router;
