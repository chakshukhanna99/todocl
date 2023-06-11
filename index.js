//jshint esversion:6
const dotenv = require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
mongoose.connect(
  "mongodb+srv://chakshukhanna2110:hello123@cluster1.dulkggs.mongodb.net/testtodo"
);
const itemsSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", itemsSchema);
// const personSchema = new mongoose.Schema({
//   name: String,
//   age: Number,
//   favouriteFruit: fruitSchema

// });
const item1 = new Item({
  name: "Welcome to the to do list app",
});
const item2 = new Item({
  name: "Hit the + icon to add new item",
});
const item3 = new Item({
  name: "<-- Hit this to delete an item",
});
// Fruit.insertMany(defaultFruits)
//       .then(function () {
//         console.log("Successfully saved defult items to DB");
//       })
//       .catch(function (err) {
//         console.log(err);
//       });
// fruit.save();
const defaultitems = [item1, item2, item3];
// Item.insertMany(defaultitems)
// .then(function(){
//   console.log("Successfully saved defult items to DB");
//   })
//   .catch(function(err){
//     console.log(err);
// });
const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listSchema);
app.get("/", function (req, res) {
  Item.find({})
    .then((foundItems) => {
      // console.log(foundItems);
      if (foundItems.length === 0) {
        return Item.insertMany(defaultitems)
          .then(() => {
            console.log("Successfully saved default items to the DB");
            // return { listTitle: "Today", newListItems: defaultitems };
          })
          .catch((err) => {
            throw new Error(err);
          });
      } else {
        return { listTitle: "Today", newListItems: foundItems };
      }
    })
    .then((renderData) => {
      res.render("list", renderData);
    })
    .catch((err) => {
      console.error(err);
    });
});
// });

// });

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  // if(listName === "Today"){
  //   item.save();
  //   res.redirect("/");
  // }else{
  // List.findOne({name:listName},function(err,founndList){
  //   founndList.items.push(item);
  //   foundList.save();
  //   res.redirect("/"+listName);
  // });
  // }

  if (listName === "Today") {
    item
      .save()
      .then(() => {
        res.redirect("/");
      })
      .catch((err) => {
        console.error(err);
        // Handle the error appropriately
      });
  } else {
    List.findOne({ name: listName })
      .then((foundList) => {
        if (foundList) {
          foundList.items.push(item);
          return foundList.save();
        } else {
          // console.log("List not found");
          // Handle the case when the list doesn't exist
          throw new Error("List not found");
        }
      })
      .then(() => {
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.error(err);
        // Handle the error appropriately
      });
  }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});
app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  // if(listName==="Today"){
  //   Item.findByIdAndRemove(checkedItemId,function(err){
  //     if(!err){
  //       console.log("Successfully deleted the element");
  //       res.redirect("/");
  //     }
  //   });
  // }else{
  //   List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
  //     if(!err){
  //       res.redirect("/"+listName);
  //     }
  //   });
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
      .then(() => {
        console.log("Successfully deleted the element");
        res.redirect("/");
      })
      .catch((err) => {
        console.error(err);
        // Handle the error appropriately
      });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    )
      .then(() => {
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.error(err);
        // Handle the error appropriately
      });
  }

  // }

  // Item.findByIdAndRemove(checkedItemId)
  // .then((removedItem) => {
  //   console.log('Successfully deleted item:', removedItem);
  //   res.redirect("/");
  // })
  // .catch((error) => {
  //   console.error('Error removing item:', error);
  // });
});

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });
app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  // List.findOne({name:customListName},function(err,foundList){
  //   if(!err){
  //     if(!foundList){
  //       console.lof("Doesn't exist");
  //     }else{
  //       console.log("exists");
  //     }
  //   }
  // });
  List.findOne({ name: customListName })
    .then((foundList) => {
      if (!foundList) {
        // console.log("Doesn't exist");
        //create a list
        const list = new List({
          name: customListName,
          items: defaultitems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // console.log("Exists");
        //show an existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch((err) => {
      console.error(err);
    });
  // const list = new List({
  //   name:customListName,
  //   items: defaultitems
  // });
  // list.save();
});

app.get("/about", function (req, res) {
  res.render("about");
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log("Server started on port 3000" + PORT);
});
