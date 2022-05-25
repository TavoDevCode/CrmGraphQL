const User = require('../models/User');
const Product = require('../models/Product');
const Client = require('../models/Client');
const Order = require('../models/Order');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env' });

const createToken = (user, key, expiresIn) => {
    const { id, name, last_name, email } = user;

    return jwt.sign({ id, name, last_name, email }, key, { expiresIn });
};

// Resolvers
const resolvers = {
    Query: {
        // Users
        getUser: async (_, {}, ctx) => {
            return ctx.user;
        },

        // Products
        getProducts: async () => {
            try {
                const products = await Product.find({});
                return products;
            } catch (e) {
                console.log(e);
            }
        },
        getProduct: async (_, { id }) => {
            try {
                const product = await Product.findById(id);
                if (!product) throw new Error('Product not found');
                return product;
            } catch (e) {
                console.log(e);
            }
        },

        // Clients
        getClients: async () => {
            try {
                const clients = await Client.find({});
                return clients;
            } catch (e) {
                console.log(e);
            }
        },
        getClientsSeller: async (_, {}, ctx) => {
            try {
                const clients = await Client.find({ seller: ctx.user.id.toString() });
                return clients;
            } catch (e) {
                console.log(e);
            }
        },
        getSpecificClient: async (_, { id }, ctx) => {
            // Check if the client exists
            // console.log(id, ctx)
            const client = await Client.findById(id);
            if (!client) throw new Error('The client not exist');

            // Verify the client
            if (client.seller.toString() !== ctx.user.id) throw new Error('No credentials');

            return client;
        },

        // Orders 📦
        getOrders: async () => {
            try {
                const orders = await Order.find({});
                return orders;
            } catch (e) {
                console.log(e);
            }
        },
        getOrdersSeller: async (_, {}, ctx) => {
            try {
                const orders = await Order.find({ seller: ctx.user.id.toString() }).populate('client');
                return orders;
            } catch (e) {
                console.log(e);
            }
        },
        getOrder: async (_, { id }, ctx) => {
            const order = await Order.findById(id);
            if (!order) throw new Error('The order not exist');

            // Verify order if of the seller
            if (order.seller.toString() !== ctx.user.id) throw new Error('No credentials');

            // Return result
            return order;
        },
        getOrderStatus: async (_, { state }, ctx) => {
            const orders = await Order.find({ seller: ctx.user.id.toString(), state });
            return orders;
        },

        // Avanced queries
        getTopClients: async () => {
            const clients = await Order.aggregate([
                { $match: { state: 'COMPLETED' } },
                {
                    $group: {
                        _id: '$client',
                        total: { $sum: '$total' },
                    },
                },
                {
                    $lookup: {
                        from: 'clients',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'client',
                    },
                },
                {
                    $sort: { total: -1 },
                },
            ]);

            return clients;
        },
        getTopSellers: async () => {
            const selles = await Order.aggregate([
                { $match: { state: 'COMPLETED' } },
                {
                    $group: {
                        _id: '$seller',
                        total: { $sum: '$total' },
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'seller',
                    },
                },
                {
                    $limit: 10,
                },
                {
                    $sort: { total: -1 },
                },
            ]);

            return selles;
        },
        searchProduct: async (_, { search }) => {
            const products = await Product.find({ $text: { $search: search } }).limit(10);
            return products;
        },
    },
    Mutation: {
        // Users
        addUser: async (_, { input }) => {
            const { email, password } = input;

            // Review existing user
            const existingUser = await User.findOne({ email });
            if (existingUser) throw new Error('The user is already registered');

            // Hash password
            const salt = bcryptjs.genSaltSync(10);
            input.password = await bcryptjs.hashSync(password, salt);

            try {
                // Save user in the database
                const user = new User(input);
                user.save(); // Save
                return user;
            } catch (e) {
                console.log(e);
            }
        },
        authenticateUser: async (_, { input }) => {
            const { email, password } = input;

            // Review existing user
            const existingUser = await User.findOne({ email });
            if (!existingUser) throw new Error('The user not exist');

            // Review password user
            const passwordCorrect = await bcryptjs.compareSync(password, existingUser.password);
            if (!passwordCorrect) throw new Error('The password is not correct');

            return {
                token: createToken(existingUser, process.env.SECRET_KEY, '24h'),
            };
        },

        // Products
        addProduct: async (_, { input }) => {
            try {
                const product = new Product(input);
                // Save user in the database
                product.save();
                return product;
            } catch (e) {
                console.log(e);
            }
        },
        updateProduct: async (_, { id, input }) => {
            let product = await Product.findById(id);
            if (!product) throw new Error('Product not found');

            // Save user in the database
            product = await Product.findOneAndUpdate({ _id: id }, input, { new: true });
            return product;
        },
        deleteProduct: async (_, { id }) => {
            try {
                let product = await Product.findById(id);
                if (!product) throw new Error('Product not found');

                // Delete product in the database
                product = await Product.findOneAndDelete({ _id: id });
                return product;
            } catch (e) {
                console.log(e);
            }
        },

        // Clients
        addClient: async (_, { input }, ctx) => {
            // Verify if the client is registered
            const { email } = input;
            const clientExists = await Client.findOne({ email });
            if (clientExists) throw new Error('The client is already registered');

            try {
                const client = new Client(input);
                // Assign client
                client.seller = ctx.user.id;

                // Save client in the database
                const result = await client.save();
                return result;
            } catch (e) {
                console.log(e);
            }
        },
        updateClient: async (_, { id, input }, ctx) => {
            // Verify if exist client
            let client = await Client.findById(id);
            if (!client) throw new Error('The client not exist');

            // Verify if seller edit
            if (client.seller.toString() !== ctx.user.id) throw new Error('No credentials');

            // update client
            client = await Client.findOneAndUpdate({ _id: id }, input, { new: true });
            return client;
        },
        deleteClient: async (_, { id }, ctx) => {
            // Verify if exist client
            let client = await Client.findById(id);
            if (!client) throw new Error('The client not exist');

            // Verify if seller edit
            if (client.seller.toString() !== ctx.user.id) throw new Error('No credentials');

            // Delete client
            await Client.findOneAndDelete({ _id: id });
            return client;
        },

        // Orders
        addOrder: async (_, { input }, ctx) => {
            const { orders, client } = input;

            console.log(input);

            console.log(orders);

            // Verify if the client exists
            const isClient = await Client.findById(client);
            if (!isClient) throw new Error('The client not exist');

            // Verify if client is of the seller
            if (isClient.seller.toString() !== ctx.user.id) throw new Error('No credentials');

            // Verify product stock
            for await (const odr of orders) {
                const { id, amount } = odr;

                const product = await Product.findById(id);
                if (amount > product.stock) throw new Error(`Stock invalid in product: ${product.name}`);
                else {
                    // Subtract stock from product
                    product.stock = product.stock - amount;
                    await product.save();
                }
            }

            // Create new order
            const newOrder = new Order(input);

            // Assign seller
            newOrder.seller = ctx.user.id;

            // save in the database
            const result = await newOrder.save();
            return result;
        },
        updateOrder: async (_, { id, input }, ctx) => {
            const { order, client } = input;
            // Verify if exist oprder
            const isOrder = await Order.findById(id);
            if (!isOrder) throw new Error('The order not exist');

            // Verify if the client exists
            const isClient = await Client.findById(client);
            if (!isClient) throw new Error('The client not exist');

            // Verify if client is of the seller
            if (isClient.seller.toString() !== ctx.user.id) throw new Error('No credentials');

            if (order) {
                // Verify product stock
                for await (const odr of order) {
                    const { id, amount } = odr;

                    const product = await Product.findById(id);
                    if (amount > product.stock) throw new Error(`Stock invalid in product: ${product.name}`);
                    else {
                        // Subtract stock from product
                        product.stock = product.stock - amount;
                        await product.save();
                    }
                }
            }

            // Update order
            const result = await Order.findOneAndUpdate({ _id: id }, input, { new: true });
            return result;
        },
        deleteOrder: async (_, { id }, ctx) => {
            // Verify if exist client
            let order = await Order.findById(id);
            if (!order) throw new Error('The order not exist');

            // Verify if seller edit
            if (order.seller.toString() !== ctx.user.id) throw new Error('No credentials');

            // Delete client
            await Order.findOneAndDelete({ _id: id });
            return order;
        },
    },
};

module.exports = resolvers;
