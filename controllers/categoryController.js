const db = require('../models')
const Category = db.Category
let categoryController = {
  getCategories: (req, res) => {
    return Category.findAll().then(categories => {
      return res.render('admin/categories',
        { categories: JSON.parse(JSON.stringify(categories)) })
    })
  }
}

module.exports = categoryController