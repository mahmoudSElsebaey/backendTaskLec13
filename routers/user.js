const express = require("express");
const User = require("../models/user");
const router = express.Router();

//////////////////////////// POST DATA
router.post("/users", (req, res) => {
  // console.log(req.body);

  const user = new User(req.body);
  user
    .save()
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

//////////////////////////// GET DATA

// 1) get all data
router.get("/users", (req, res) => {
  User.find({})
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// 2) get first 2 doc
router.get("/users/:id", (req, res) => {
  const _id = req.params.id;
  User.findById(_id)
    .then((user) => {
      if (!user) {
        res.status(404).send("Unable To Find This User");
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

//////////////////////////// PATCH DATA
// patch first 3 doc

router.patch("/users/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const updates = Object.keys(req.body);
    // console.log(updates);

    // const user = await User.findByIdAndUpdate(_id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    const user = await User.findById(_id);

    if (!user) {
      return res.status(404).send("Unable To Find This User");
    }

    updates.forEach((ele) => (user[ele] = req.body[ele]));
    await user.save();
    res.status(200).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

//////////////////////////// DELETE DATA
// delete last 2 doc

router.delete("/users/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    const user = await User.findByIdAndDelete(_id);
    if (!user) {
      return res.status(404).send("Unable To Find This User");
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(err);
  }
});

// /////////////////////////////////////////////////////////
/// =====> Login

router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateToken();
    res.status(200).send({ user, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

////////////////////////////////////////////////////////////////////
/////////////// ======> token
router.post("/users", async (req, res) => {
  try {
    const user = new User(req.body);
    const token = await user.generateToken();
    await user.save();
    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
