const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = '8b0d7656d65a4d3'


const adminService = {
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({ include: [Category] }).then(restaurants => {
      callback({ restaurants: JSON.parse(JSON.stringify(restaurants)), user: req.user, isAuthenticated: req.isAuthenticated })
    })
  },

  createRestaurant: (req, res, callback) => {
    Category.findAll().then(categories => {
      return callback({ categories: JSON.parse(JSON.stringify(categories)) })
    })
  },

  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, { include: [Category] }).then(restaurant => {
      callback({ restaurant: JSON.parse(JSON.stringify(restaurant)) })
    })
  },

  editRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id).then(restaurant => {
      Category.findAll().then(categories => {
        return callback({ restaurant: JSON.parse(JSON.stringify(restaurant)), categories: JSON.parse(JSON.stringify(categories)) })
      })
    })
  },

  postRestaurant: (req, res, callback) => {
    if (!req.body.name) {
      callback({ status: 'error', message: "name didn't exist" })
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name: req.body.name,
          tel: req.body.tel,
          address: req.body.address,
          opening_hours: req.body.opening_hours,
          description: req.body.description,
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId,
        }).then((restaurant) => {
          callback({ status: 'success', message: "restaurant was successfully created" })
        })
      })
    }
    else {
      return Restaurant.create({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        image: null,
        CategoryId: req.body.categoryId,
      }).then((restaurant) => {
        callback({ status: 'success', message: "restaurant was successfully created" })
      })
    }
  },

  putRestaurant: (req, res, callback) => {
    if (!req.body.name) {
      callback({ status: 'error', message: "name didn't exist" })
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id)
          .then((restaurant) => {
            restaurant.update({
              name: req.body.name,
              tel: req.body.tel,
              address: req.body.address,
              opening_hours: req.body.opening_hours,
              description: req.body.description,
              image: file ? img.data.link : restaurant.image,
              CategoryId: req.body.categoryId,
            })
              .then((restaurant) => {
                callback({ status: 'success', message: "restaurant was successfully to update" })
              })
          })
      })
    }
    else
      return Restaurant.findByPk(req.params.id)
        .then((restaurant) => {
          restaurant.update({
            name: req.body.name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            image: restaurant.image,
            CategoryId: req.body.categoryId,
          })
            .then((restaurant) => {
              callback({ status: 'success', message: "restaurant was successfully to update" })
            })
        })
  },

  deleteRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id)
      .then((restaurant) => {
        restaurant.destroy()
          .then((restaurant) => {
            callback({ status: 'success', message: '' })
          })
      })
  },

  getUsers: (req, res, callback) => {
    return User.findAll().then(users => {
      callback({ users: JSON.parse(JSON.stringify(users)) })
    })
  },

  putUsers: (req, res, callback) => {
    return User.findByPk(req.params.id).then(user => {
      if (req.user.id === user.id) {
        req.flash('error_messages', "without permission change")
        res.redirect('/admin/users')
      } else {
        user.update({
          isAdmin: !user.isAdmin
        }).then(user => {
          callback({ status: 'success', message: 'user was successfully to update' })
        })
      }
    })
  }

}

module.exports = adminService