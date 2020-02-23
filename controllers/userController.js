const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = '8b0d7656d65a4d3'

let userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同')
      return res.redirect('/signup')
    } else {
      // confirm unique user

      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  //// User profile 

  // 若是在取得使用者資料以前加一層 if(req.params.id !== res.locals.user.id ) 的判別直接不給認證 強制單一帳號只能瀏覽自身的profile 就可以直接從 res.locals.user 直接取得 使用者資料   !!!(若是直接封裝到 authenticated 簡化寫法?)

  ////
  getUser: (req, res) => {
    const userId = Number(req.params.id)
    if (userId !== req.user.id) {
      req.flash('error_messages', 'without permission！')
      return res.redirect(`/users/${res.locals.user.id}`)
    }

    User.findByPk(userId, {
      include: [
        { model: Comment, include: [Restaurant] }
      ]
    }).then(results => {
      return res.render('userProfile/users', { users: results.dataValues, comments: JSON.parse(JSON.stringify(results.dataValues.Comments)) })

    })
  },

  editUser: (req, res) => {
    const userId = Number(req.params.id)
    if (userId !== req.user.id) {
      req.flash('error_messages', 'without permission！')
      return res.redirect(`/users/${res.locals.user.id}`)
    }
    return res.render('userProfile/edit', { users: res.locals.user })
  },

  putUser: (req, res) => {
    const userId = Number(req.params.id)
    if (userId !== req.user.id) {
      req.flash('error_messages', 'without permission！')
      return res.redirect(`/users/${req.params.id}`)
    }
    if (!req.body.name) {
      req.flash('error_messages', "name didn't exist")
      return res.redirect('back')
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
                req.flash('success_messages', 'user was successfully to update')
                res.redirect(`/users/${res.locals.user.id}`)
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
              req.flash('success_messages', 'user was successfully to update')
              res.redirect(`/users/${res.locals.user.id}`)
            })
        })
  },

  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then((restaurant) => {
      req.flash('success_messages', "Add Favorite")
      return res.redirect('back')
    })
  },

  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        favorite.destroy()
          .then((restaurant) => {
            req.flash('success_messages', "Deleted Favorite")
            return res.redirect('back')
          })
      })
  },

  likeRestaurant: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    }).then((restaurant) => {
      req.flash('success_messages', "Like")
      return res.redirect('back')
    })
  },

  unlikeRestaurant: (req, res) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then((like) => {
        like.destroy()
          .then((restaurant) => {
            req.flash('success_messages', " Unlike")
            return res.redirect('back')
          })
      })
  },

  getTopUser: (req, res) => {
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
      return res.render('topUser', { users: users })
    })
  },

  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then((followship) => {
        return res.redirect('back')
      })
  },

  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        followship.destroy()
          .then((followship) => {
            return res.redirect('back')
          })
      })
  },

}

module.exports = userController