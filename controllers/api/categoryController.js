const db = require('../../models')
const Category = db.Category

const categoryService = require('../../services/categoryServices')

let categoryController = {
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, (data) => {
      return res.json(data)
    })
  },

  postCategories: (req, res) => {
    categoryService.postCategories(req, res, (data) => {
      return res.json(data)
    })
  },

  putCategories: (req, res) => {
    categoryService.putCategories(req, res, (data) => {
      return res.json(data)
    })
  },

}

module.exports = categoryController