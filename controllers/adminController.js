const db = require('../models')
const Restaurant = db.Restaurant

const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll().then(restaurants => {
      //console.log(JSON.parse(JSON.stringify(restaurants)))
      return res.render('admin/restaurants', { restaurants: JSON.parse(JSON.stringify(restaurants)), user: req.user, isAuthenticated: req.isAuthenticated })
    })
  },

  createRestaurant: (req, res) => {
    return res.render('admin/create')
  },

  postRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }
    return Restaurant.create({
      name: req.body.name,
      tel: req.body.tel,
      address: req.body.address,
      opening_hours: req.body.opening_hours,
      description: req.body.description
    })
      .then((restaurant) => {
        req.flash('success_messages', "restaurant was successful created")
        res.redirect('/admin/restaurants')
      })
  },
  //單數餐廳
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id).then(restaurant => {
      return res.render('admin/restaurant', { restaurant: JSON.parse(JSON.stringify(restaurant)) })
    })
  },

  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id).then(restaurant => {
      return res.render('admin/create', { restaurant: JSON.parse(JSON.stringify(restaurant)) })
    })
  },

  putRestaurant: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
    }

    return Restaurant.findByPk(req.params.id).then((restaurant) => {
      restaurant.update({
        name: req.body.name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description
      })
        .then((restaurant) => {
          req.flash('success_messages', "restaurant was successful update")
          res.redirect('/admin/restaurants')
        })
    })
  },

}

module.exports = adminController