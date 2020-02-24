const db = require('../../models')
const Restaurant = db.Restaurant
const Category = db.Category

const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({ include: [Category] }).then(restaurants => {
      return res.json({ restaurants: JSON.parse(JSON.stringify(restaurants)), user: req.user, isAuthenticated: req.isAuthenticated })
    })
  }
}

module.exports = adminController