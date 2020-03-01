const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship

const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

let userService = {

  //// User profile 

  // 若是在取得使用者資料以前加一層 if(req.params.id !== res.locals.user.id ) 的判別直接不給認證 強制單一帳號只能瀏覽自身的profile 就可以直接從 res.locals.user 直接取得 使用者資料   !!!(若是直接封裝到 authenticated 簡化寫法?)

  ////
  getUser: (req, res, callback) => {
    const userId = Number(req.params.id)
    // if (userId !== req.user.id) {
    //   req.flash('error_messages', 'without permission！')
    //   return res.redirect(`/users/${res.locals.user.id}`)
    // }

    User.findByPk(userId, {
      include: [
        { model: Comment, include: [Restaurant] },
        { model: Restaurant, as: 'FavoritedRestaurants' },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    }).then(results => {

      const comments = JSON.parse(JSON.stringify(results.dataValues.Comments))
      const set = new Set()
      const commentsFilter = comments.filter(comment => !set.has(comment.RestaurantId) ? set.add(comment.RestaurantId) : false)

      const favoriteRestaurants = JSON.parse(JSON.stringify(results.dataValues.FavoritedRestaurants))
      const following = JSON.parse(JSON.stringify(results.dataValues.Followings))
      const follower = JSON.parse(JSON.stringify(results.dataValues.Followers))
      const isFollowed = JSON.parse(JSON.stringify(results.dataValues.Followings)).map(following => following.id).includes(res.locals.user.id)

      return callback({
        users: results.dataValues,
        comments,
        favoriteRestaurants,
        following,
        follower,
        isFollowed,
        commentsFilter
      })

    })
  },

  editUser: (req, res, callback) => {
    const userId = Number(req.params.id)
    if (userId !== req.user.id) {
      req.flash('error_messages', 'without permission！')
      return res.redirect(`/users/${res.locals.user.id}`)
    }
    return callback({ users: res.locals.user })
  },

  putUser: (req, res, callback) => {
    const userId = Number(req.params.id)
    if (userId !== req.user.id) {
      return callback({ status: 'error', message: 'permission denied' })
    }

    const { file } = req // const file = req.file
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then((user) => {
            user.update({
              name: req.body.name,
              image: file ? img.data.link : user.image,
            })
              .then((user) => {
                return callback({ status: 'success', message: 'updated successfully' })
              })
          })
      })
    }
    else
      return User.findByPk(req.params.id)
        .then((user) => {
          user.update({
            name: req.body.name,
            image: user.image
          })
            .then((user) => {
              return callback({ status: 'success', message: 'updated successfully' })
            })
        })
  },

  addFavorite: (req, res, callback) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then((restaurant) => {
      return callback({ status: 'success', message: '' })
    })
  },

  removeFavorite: (req, res, callback) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        favorite.destroy()
          .then((restaurant) => {
            return callback({ status: 'success', message: '' })
          })
      })
  },

  likeRestaurant: (req, res, callback) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then((restaurant) => {
      return callback({ status: 'success', message: '' })
    })
  },

  unlikeRestaurant: (req, res, callback) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((like) => {
        like.destroy()
          .then((restaurant) => {
            return callback({ status: 'success', message: '' })
          })
      })
  },

  getTopUser: (req, res, callback) => {
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        // 計算追蹤者人數
        FollowerCount: user.Followers.length,
        // 判斷目前登入使用者是否已追蹤該 User 物件
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      // 依追蹤者人數排序清單
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return callback({ users: users })
    })
  },

  addFollowing: (req, res, callback) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then((followship) => {
        return callback({ status: 'success', message: '' })
      })
  },

  removeFollowing: (req, res, callback) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        followship.destroy()
          .then((followship) => {
            return callback({ status: 'success', message: '' })
          })
      })
  },

}

module.exports = userService 