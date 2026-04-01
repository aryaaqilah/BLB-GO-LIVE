import mongoose from 'mongoose';
import User from './models/User.js';
import Address from './models/Address.js';
import Order from './models/Order.js';
import Product from './models/Product.js';
import Item from './models/Item.js';
import Component from './models/Component.js';
import Delivery from './models/Delivery.js';
import Discount from './models/Discount.js';
import Province from './models/Province.js';
import City from './models/City.js';
import District from './models/District.js';
import PostalCode from './models/PostalCode.js';
import ThreeDModel from './models/3DModel.js';
import AdministrationFee from './models/AdministrationFee.js';


const MONGODB_URI = 'mongodb+srv://bercintalewatbunga_db_user:7F29fbo7G1zgkQnf@bercintalewatbunga.wzelzbn.mongodb.net/?appName=bercintalewatbunga'; 

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        

        
        
        await Promise.all([
            User.deleteMany({}),
            Order.deleteMany({}),
            Product.deleteMany({}),
            Item.deleteMany({}),
            Component.deleteMany({}),
            Address.deleteMany({}),
            Delivery.deleteMany({}),
            Discount.deleteMany({}),
            Province.deleteMany({}),
            City.deleteMany({}),
            District.deleteMany({}),
            PostalCode.deleteMany({}),
            ThreeDModel.deleteMany({}),
            AdministrationFee.deleteMany({}),
        ]);
        

        
         ---');
        
        const adminFee = await AdministrationFee.create({ Fee: 7500 });
        
        
        const discountPromo = await Discount.create({ Name: 'DISKON10', Percentage: 0.10, Maximum: 50000 });
        

        const deliveryService = await Delivery.create({ 
            ShippingCode: 'DEL001XYZ', 
            Service: 'Express', 
            EstimatedArrival: new Date('2025-12-20'),
            TrackingLink: 'http://track.delivery.com/001'
        });
        

        const componentA = await Component.create({ Name: 'Chipset XYZ', Price: 150000, Asset: '/assets/chip.url' });
        const componentB = await Component.create({ Name: 'Casing Premium', Price: 300000, Asset: '/assets/case.url' });
        : ID ${componentA._id}, ${componentB._id}`);
        
        const model3D = await ThreeDModel.create({ 
            Path: '/models/robot.obj', 
            Question: 'Apakah ini tahan air?', 
            Answer: 'Ya, rating IP67.' 
        });
        

        const province1 = await Province.create({ Name: 'DKI Jakarta' });
        

        
        

        const city1 = await City.create({ Name: 'Jakarta Selatan', ProvinceId: province1._id });
        

        const district1 = await District.create({ Name: 'Kebayoran Baru', CityId: city1._id });
        
        
        const postalCode1 = await PostalCode.create({ Name: '12120', DistrictId: district1._id });
        

        const item1 = await Item.create({ ComponentId: componentA._id, Quantity: 2 });
        const item2 = await Item.create({ ComponentId: componentB._id, Quantity: 1 });
        : ID ${item1._id}, ${item2._id}`);
        
        const address1 = await Address.create({
            RecipientNumber: '0812111222',
            RecipientName: 'Budi Santoso',
            ProvinceId: province1._id,
            CityId: city1._id,
            DistrictId: district1._id,
            PostalCodeId: postalCode1._id,
            Detail: 'Jalan Senopati No. 5'
        });
        

        
        
        
        const productA = await Product.create({
            Name: 'Robot Kit Basic',
            Price: 500000,
            Quantity: 10,
            Image: '/img/robot.png',
            '3DModelId': model3D._id,
            Items: [item1._id, item2._id] 
        });
        
        
        const user1 = await User.create({
            Name: 'Ahmad Zaki',
            Email: 'ahmad@example.com',
            Password: 'hashedpassword' 
        });
        

        
        

        const order1 = await Order.create({
            Status: 'PENDING',
            AddressId: address1._id,
            DeliveryId: deliveryService._id,
            ProductId: productA._id,
            ProductPrice: productA.Price * 1.0, 
            AdministrationFee: adminFee._id,
            DiscountId: discountPromo._id,
            Total: (productA.Price + adminFee.Fee) * (1 - discountPromo.Percentage) 
            
        });
        
        
        
        user1.Orders.push(order1._id);
        await user1.save();
        
        
        
        

    } catch (error) {
        console.error('❌ Error saat seeding data:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        
    }
};


seedDatabase();