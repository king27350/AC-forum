const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
//const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = '8b0d7656d65a4d3'

const adminService = require('../services/adminServices')

const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.render('admin/restaurants', data)
    })
  },

  createRestaurant: (req, res) => {
    Category.findAll().then(categories => {
      return res.render('admin/create', { categories: JSON.parse(JSON.stringify(categories)) })
    })
  },

  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      res.redirect('/admin/restaurants')
    })
  },
  //單數餐廳
  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, (data) => {
      return res.render('admin/restaurant', data)
    })
  },

  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id).then(restaurant => {
      Category.findAll().then(categories => {
        return res.render('admin/create', { restaurant: JSON.parse(JSON.stringify(restaurant)), categories: JSON.parse(JSON.stringify(categories)) })
      })

    })
  },

  putRestaurant: (req, res) => {
    adminService.putRestaurant(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      }
      req.flash('success_messages', data['message'])
      res.redirect('/admin/restaurants')
    })
  },

  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('/admin/restaurants')
      }
    })
  },

  ///////// Users 使用者權限管理 //////// 
  getUsers: (req, res) => {
    return User.findAll().then(users => {
      return res.render('admin/users', { users: JSON.parse(JSON.stringify(users)) })
    })
  },

  putUsers: (req, res) => {
    return User.findByPk(req.params.id).then(user => {
      if (req.user.id === user.id) {
        req.flash('error_messages', "without permission change")
        res.redirect('/admin/users')
      } else {
        user.update({
          isAdmin: !user.isAdmin
        }).then(user => {
          req.flash('success_messages', "user state updated")
          res.redirect('/admin/users')
        })
      }

    })
  }

}

module.exports = adminController