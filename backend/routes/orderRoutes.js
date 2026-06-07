import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Address from "../models/Address.js"
import Province from "../models/Province.js"
import City from "../models/City.js"
import District from "../models/District.js"
import PostalCode from "../models/PostalCode.js"
import Delivery from "../models/Delivery.js"
import Product from "../models//Product.js"
import ThreeDModel from "../models/3DModel.js"
import Item from "../models/Item.js"
import AdministrationFee from "../models/AdministrationFee.js";
import mongoose from 'mongoose';

const router = express.Router();
const POPULATE_FIELDS = ['AddressId', 'DeliveryId', 'ProductId', 'AdministrationFee', 'ShopId', 'UserId'];


router.post("/", async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) { res.status(400).json({ error: err.message }); }
});


router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().populate(POPULATE_FIELDS);
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({ path: "UserId", select: "Name Email" })
      .populate({ 
        path: "AddressId", 
        populate: ["ProvinceId", "CityId", "DistrictId"] 
      })
      .populate("DeliveryId")
      .populate({
        path: "ProductId",
        populate: {
          path: "ProductDetail",
          populate: { path: "ItemId", model: "Item" }
        }
      })
      .populate("AdministrationFee");

    if (!order) return res.status(404).json({ error: "Pesanan tidak ditemukan" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put("/status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { Status } = req.body;

    
    
    const order = await Order.findOneAndUpdate(
      { _id: id, Status: 3 }, 
      { Status: Status }, 
      { new: true }
    );

    if (!order) {
      return res.status(400).json({ 
        error: "Gagal memperbarui. Pesanan mungkin sudah selesai atau belum dalam pengiriman." 
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.status(204).send();
  } catch (err) { res.status(400).json({ error: err.message }); }
});



router.patch("/:id/token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { Token: token },
      { new: true }
    ).populate(POPULATE_FIELDS);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.patch("/:id/status-pembayaran", async (req, res) => {
  try {
    const { StatusPembayaran } = req.body;

    
    const allowedStatus = [0, 1, 2];
    if (!allowedStatus.includes(StatusPembayaran)) {
      return res.status(400).json({
        error: "StatusPembayaran harus bernilai 0, 1, atau 2",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { StatusPembayaran },
      { new: true }
    ).populate(POPULATE_FIELDS);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
      }
});

router.patch("/:id/cancel", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).send("Order not found");

    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Reason is required" });
    }

    
    if (order.StatusPembayaran !== 0) {
      await Order.updateOne(
        { _id: order._id },
        {
          StatusPembayaran: 3, 
          Status: 5, 
        }
      );

      await restoreStock(order._id);

      return res.json({ message: "Order cancelled (no payment)" });
    }

    
    await restoreStock(order._id);
    
    const response = await fetch(
      `https://api.sandbox.midtrans.com/v2/${order._id}/refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization":
            "Basic " +
            Buffer.from(process.env.MIDTRANS_SERVER_KEY + ":").toString("base64"),
        },
        body: JSON.stringify({
          refund_key: "refund-" + Date.now(),
          amount: order.Total,
          reason: reason, 
        }),
      }
    );

    const data = await response.json();

    await Order.updateOne(
      { _id: order._id },
      {
        StatusPembayaran: 4, 
        Status: 5, 
      }
    );

    res.json({ message: "Refund initiated", data });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/:id/update-status-order", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).send("Order not found");

    const { Status } = req.body;
    
      await Order.updateOne(
        { _id: order._id },
        {
          Status: Status, 
        }
      );


  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/florist/:id", async (req, res) => {
  try {
    const orders = await Order.find({ "ShopId": req.params.id })
      .populate({ 
        path: "UserId", 
        model: "User",
        select: "Name Email" 
      })
      .populate({ 
        path: "AddressId", 
        model: "Address",
        populate: [
          { path: "ProvinceId", model: "Province" },
          { path: "CityId", model: "City" },
          { path: "DistrictId", model: "District" }
        ]
      })
      .populate({
        path: "DeliveryId",
        model: "Delivery"
      })
      .populate({
        path: "ProductId",
        model: "Product",
        populate: [
          { path: "ThreeDModel", model: "3DModel" },
          { 
            path: "ProductDetail", 
            model: "ProductDetail",
            populate: {
              path: "ItemId",
              model: "Item"
            }
          }
        ]
      })
      .populate({
        path: "AdministrationFee",
        model: "AdministrationFee"
      })
      .sort({ CreatedAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(200).json([]); 
    }
    
    res.json(orders);
  } catch (err) {
    console.error("Florist Orders Error:", err);
    res.status(500).json({ error: err.message });
  }
});

const restoreStock = async (orderId) => {
  const order = await Order.findById(orderId)
  .populate({ path: "UserId", select: "Name Email" })
      .populate({ 
        path: "AddressId", 
        populate: ["ProvinceId", "CityId", "DistrictId"] 
      })
      .populate("DeliveryId")
      .populate({
        path: "ProductId",
        populate: {
          path: "ProductDetail",
          populate: { path: "ItemId", model: "Item" }
        }
      })
      .populate("AdministrationFee");

  const items = order.ProductId.ProductDetail;
  

  for (const item of items) {
    await Item.updateOne(
      { _id: item.ItemId._id },
      { $inc: { stok: item.Quantity } } 
    );
  }

  
};

router.patch("/update-status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { Status, ShippingCode, TrackingLink, Service } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: "Order tidak ditemukan" });
    }

    
    if (Status !== undefined) {
      order.Status = Status;
    }

    await order.save();

    
    if (order.DeliveryId) {
      await Delivery.findByIdAndUpdate(order.DeliveryId, {
        ShippingCode,
        TrackingLink,
        Service
      });
    }

    res.json({ message: "Berhasil update order & delivery" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/admin/list", async (req, res) => {
  try {
    const orders = await Order.find({ IsDeleted: false })
      .populate("UserId", "Name")
      .populate("ShopId", "Name")
      .sort({ CreatedAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/admin/:id", async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { IsDeleted: true });
    res.json({ message: "Pesanan berhasil dihapus dari sistem" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;