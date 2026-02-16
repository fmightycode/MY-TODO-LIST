require("dotenv").config();
const _ = require("lodash");
const express = require("express");
const path = require("path");
const app = express();
const date = require(path.join(__dirname, "module.js"));
const day = date.getDate();
const mongoose = require("mongoose");
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join("public")));
app.use(express.json());

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"));
mongoose.connect(`${process.env.MONGO_URL}`).then(() => console.log("Connected to MongoDB Atlas"))
.catch(err => console.error(err));
const itemsSchema = new mongoose.Schema({ 
    name: {
        type: String,
        require: [true, "Name is required"],
        trim: true
    }
});

const Item = mongoose.model("Items", itemsSchema);
const defaultLists = [
  { name: "Welcome to my todo list!" },
  { name: "Check the box for completed task" },
  { name: "Create custom list using /your-list" }
];

const listSchema = new mongoose.Schema({ 
    name: {
        type: String,
        require: [true, "Name is required"],
        trim: true
    },
    items: [itemsSchema]
});

const List = mongoose.model("Lists", listSchema);

app.route("/")
    .get(async(req, res) => {
    try {
        const foundList = await Item.find();
        if (foundList.length === 0){ 
            await Item.insertMany(defaultLists)
            res.redirect("/");
        }
        else{ 
            res.render("list", {listTitle: day, addItem: foundList});
        }
    } catch (err) {
        console.error(err)
    }
})
   .post(async(req, res) => {
     const requestbody = req.body.newItem;
     const listName = req.body.list;
     const item = new Item ({ 
        name: requestbody
     });
      try {
         if (listName === day){ 
            await item.save();
            res.redirect("/");
     } else { 
        const foundList = await List.findOne({name: listName});
        foundList.items.push(item);
        await foundList.save();
        res.redirect("/"+listName)
     }
        }
      catch (err) {
        console.error(err)
    }
});

app.post("/delete", async(req, res) => { 
    const deleteId = await req.body.delete;
    const postTitle = await req.body.post;
    try {
        if (postTitle === day){ 
            await Item.findByIdAndDelete(deleteId);
            res.redirect("/");
        } else{ 
            await List.findOneAndUpdate({name: postTitle}, {$pull: {items: {_id: deleteId}}});
            res.redirect("/"+postTitle)
        }
    } catch (err) {
        console.log(err)
    }
});

app.get("/:customName", async(req, res) => { 
    const customName = _.capitalize(req.params.customName);
    const foundList = await List.findOne({name: customName});
    try {
        if (!foundList){ 
            const list = new List({ 
              name: customName,
              items: defaultLists
            });
            list.save();
            res.redirect("/"+customName)
        } else{ 
             res.render("list", {listTitle: foundList.name, addItem: foundList.items});
        }
        
    } catch (err) {
        console.log(err)
    }
})

app.listen(process.env.PORT || 3000, function(){ 
    console.log(`This server is listen on port ${process.env.PORT}`)
});