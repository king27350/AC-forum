const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User

const pageLimit = 10

const restServices = require('../services/restServices')

let restController = {
  getRestaurants: (req, res) => {
    restServices.getRestaurants(req, res, (data) => {
      return res.render('restaurants', data)
    })
  },

  getRestaurant: (req, res) => {
    restServices.getRestaurant(req, res, (data) => {
      return res.render('restaurant', data)
    })
  },

  getFeeds: (req, res) => {
    restServices.getFeeds(req, res, (data) => {
      return res.render('feeds', data)
    })
  },

  getDashboard: (req, res) => {
    restServices.getDashboard(req, res, (data) => {
      return res.render('dashboard', data)
    })
  },

  getTopRestaurants: (req, res) => {
    restServices.getTopRestaurants(req, res, (data) => {
      return res.render('topRestaurants', data)
    })
  }
}

module.exports = restController