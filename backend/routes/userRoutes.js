import express from "express";
import User from "../models/User.js";
import Address from "../models/Address.js"
import Province from "../models/Province.js"
import City from "../models/City.js"
import District from "../models/District.js"
import PostalCode from "../models/PostalCode.js"
import Delivery from "../models/Delivery.js"
import Product from "../models//Product.js"
import ThreeDModel from "../models/3DModel.js"
import Order from "../models/Order.js"
import Item from "../models/Item.js"
import AdministrationFee from "../models/AdministrationFee.js";
import Shop from "../models/Shop.js"
import ProductDetail from "../models/ProductDetail.js"

const router = express.Router();


router.post("/", async (req, res) => {
  try {
    const user = new User(req.body);
    
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get("/", async (req, res) => {
  try {
    const users = await User.find().populate('Orders');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let account = await User.findOne({ "Email": email, "Password": password });
    let type = "customer";

    if (!account) {
      account = await Shop.findOne({ "Email": email, "Password": password });
      type = "florist";
    }

    if (!account) {
      return res.status(404).json({ error: "Email atau Password salah" });
    }

    const responseData = account.toObject();
    responseData.userType = type;

    res.json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('Orders');
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.put("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id/add-order", async (req, res) => {
  try {
    const userId = req.params.id;
    const { OrderId } = req.body;

    
    

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        
        $push: { Orders: OrderId } 
      },
      { new: true } 
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Gagal update user", error });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.status(204).send();
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const orders = await Order.find({ UserId: req.params.id }).populate([
      { 
        path: "AddressId", 
        model: Address,
        populate: [
          { path: "ProvinceId", model: Province },
          { path: "CityId", model: City },
          { path: "DistrictId", model: District }
        ]
      },
      {
        path: "DeliveryId",
        model: Delivery
      },
      {
        path: "ProductId",
        model: Product,
        populate: [
          { path: "ThreeDModel", model: ThreeDModel },
          { 
            path: "ProductDetail", 
            model: ProductDetail,
            populate: [
              {
                path: "ItemId",
                model: Item,
              }
            ]
         }
        ]
      },
      {
        path: "AdministrationFee",
        model: AdministrationFee
      }
    ]).sort({ CreatedAt: -1 });
    const userResponse = user.toObject();
    userResponse.Orders = orders;
    res.json(userResponse);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;