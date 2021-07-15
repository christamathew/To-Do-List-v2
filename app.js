//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });
const itemSchema={
  name:String
};
const Item= mongoose.model("Item", itemSchema);

const item1=new Item({
  name:"Breathe"
});
const item2=new Item({
  name:"Live"
});
const item3=new Item({
  name:"Laugh"
});
const defaultItems=[item1, item2, item3];
const listSchema={
  name:String,
  items:[itemSchema]
};
const List=mongoose.model("List", listSchema);


app.get("/", function(req, res) {
  
  Item.find({},function(err, founditems){
    if(founditems.length===0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("success");
        }
        });
        res.redirect("/");
    }
    else{
    res.render("list", {listTitle: "Today", newListItems: founditems});
    }
});

});

app.post("/", function(req, res){

 const itemName=req.body.newItem;
 const listName=req.body.list;
 const item= new Item({
   name:itemName
 });

 if(listName==="Today"){
  item.save();
  res.redirect("/");
 }
 else{
  List.findOne({name:listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
   });
 }
 
});

app.get("/about", function(req, res){
  res.render("about");
});
app.post("/delete", function(req, res){
  const checkedItem=req.body.checkbox;
  Item.findByIdAndRemove(checkedItem, function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("deleted");
    }
});
res.redirect("/");
});
app.get("/:customListName", function(req, res){
  customListName=req.params.customListName;
  List.findOne({name:customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
  
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
