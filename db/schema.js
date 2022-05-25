const { gql } = require('apollo-server');

// Schema
const typeDefs = gql`
    #Types

    type User {
        id: ID
        name: String
        last_name: String
        phone: String
        email: String
        created_at: String
    }

    type Token {
        token: String
    }

    type Product {
        id: ID
        name: String
        price: Float
        stock: Int
        created_at: String
    }

    type Client {
        id: ID
        name: String
        last_name: String
        business: String
        email: String
        phone: String
        seller: ID
        created_at: String
    }

    type Order {
        id: ID
        orders: [OrderGroup]
        total: Float
        client: Client
        seller: ID
        state: OrderState
        created_at: String
    }

    type OrderCreate {
        id: ID
        orders: [OrderGroup]
        total: Float
        client: ID
        seller: ID
        state: OrderState
        created_at: String
    }

    type OrderGroup {
        id: ID
        amount: Int
        name: String
        price: Float
    }

    type TopClients {
        total: Float
        client: [Client]
    }

    type TopSellers {
        total: Float
        seller: [User]
    }

    #Inputs

    input UserInput {
        name: String!
        last_name: String!
        phone: String!
        email: String!
        password: String!
    }

    input AuthenticateInput {
        email: String!
        password: String!
    }

    input ProductInput {
        name: String!
        price: Float!
        stock: Int!
    }

    input ClientInput {
        name: String!
        last_name: String!
        business: String!
        email: String!
        phone: String
    }

    input OrderGroupProduct {
        id: ID
        amount: Int
        name: String
        price: Float
    }

    input OrderInput {
        orders: [OrderGroupProduct]
        total: Float
        client: ID
        state: OrderState
    }

    #Enums
    enum OrderState {
        PENDING
        COMPLETED
        CANCELED
    }

    #Querys

    type Query {
        #Users
        getUser: User

        #Products
        getProducts: [Product]
        getProduct(id: ID!): Product

        #Clients
        getClients: [Client]
        getClientsSeller: [Client]
        getSpecificClient(id: ID!): Client

        #Orders 📦
        getOrders: [Order]
        getOrdersSeller: [Order]
        getOrder(id: ID!): Order
        getOrderStatus(state: String!): [Order]

        #Advanced queries
        getTopClients: [TopClients]
        getTopSellers: [TopSellers]
        searchProduct(search: String!): [Product]
    }

    #Mutations

    type Mutation {
        # Users
        addUser(input: UserInput): User
        authenticateUser(input: AuthenticateInput): Token

        #Products
        addProduct(input: ProductInput): Product
        updateProduct(id: ID!, input: ProductInput): Product
        deleteProduct(id: ID!): Product

        #Clients
        addClient(input: ClientInput): Client
        updateClient(id: ID!, input: ClientInput): Client
        deleteClient(id: ID!): Client

        #Orders 📦
        addOrder(input: OrderInput): OrderCreate
        updateOrder(id: ID!, input: OrderInput): Order
        deleteOrder(id: ID!): Order
    }
`;

module.exports = typeDefs;
