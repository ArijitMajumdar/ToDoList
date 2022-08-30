const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');
mongoose.connect("mongoURL");

const itemsSchema = {
    name: String
};

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const Item = mongoose.model("Item",itemsSchema);
const List = mongoose.model("List",listSchema);

const item1 = Item({name:"Buy groceries"});
const item2 = Item({name:"Send emails"});
const item3 = Item({name:"Finalize Project"});
const defaultItems = [item1,item2,item3];

app.get("/favicon.ico", function (req, res) {
    res.redirect("/");
  });

app.get("/",function(req,res){
    Item.find({},function(err,items){
        if(items.length == 0)
        {
            Item.insertMany(defaultItems,function(err)
            {
                if(err)
                {console.log(err);}
                else{
                    console.log("succesfully entered");
                }
            });
            res.redirect("/");
        }
        else{
            res.render("list",{listName:"Today",newListItem:items});
        }
      
    });
    
   
});

app.get("/:customListName",function(req,res){
    List.findOne({name: _.capitalize(req.params.customListName)},function(err,foundList){
    if(!err)
    {
    if(!foundList)
    { 
    const list = new List({name:_.capitalize(req.params.customListName),items:defaultItems});
    list.save();
    res.redirect("/" + _.capitalize(req.params.customListName) );  
    }
    else{ 
        res.render("list",{listName:foundList.name,newListItem:foundList.items})
    
    }
    };
});
});


app.get("/about",function(req,res){
    res.render("about");
}
);



app.post("/create",function(req,res) {
       
    const itemName =req.body.newItem;
    const lName = req.body.list;
 
    const item = new Item({name:itemName});

        if(lName == "Today")
        {
        item.save();
        res.redirect("/");
        }
        else
        {
                List.findOne({name:lName},function(err,foundList){
                    foundList.items.push(item);
                    foundList.save();
                    res.redirect("/" + lName);
                });
        }
   
});

app.post("/delete",function (req,res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    
    if(listName == "Today")
    {
    Item.findByIdAndRemove(checkedItemId,function(err)
    {   
        if(!err)
        {
            console.log("item succesfully deleted");
            res.redirect("/");
         }
    });
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkedItemId}}},function(err,foundList){
            if(!err)
            {
                res.redirect("/" + listName);
            }
        });
    }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port,function(){
    console.log("server is running at port 3000");
});
