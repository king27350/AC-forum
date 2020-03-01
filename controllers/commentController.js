
const commentService = require('../services/commentServices')

let commentController = {
  postComment: (req, res) => {
    commentService.postComment(req, res, (data) => {
      return res.redirect(`/restaurants/${data['RestaurantId']}`)
    })
  },

  deleteComment: (req, res) => {
    commentService.deleteComment(req, res, (data) => {
      return res.redirect(`/restaurants/${data['RestaurantId']}`)
    })
  }
}

module.exports = commentController