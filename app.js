const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery',false);
mongoose.connect('mongodb://127.0.0.1/todolistDB');

const itemsSchema = {
    name: String
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to todolist."
});
const item2 = new Item({
    name: "Hit the + button to aff a new item."
});
const item3 = new Item({
    name: "<-- Hit this to delete an item -->"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req,res){
    


Item.find({}, function(err, foundItems){
    if(foundItems.length===0){
        Item.insertMany(defaultItems, function(err){
            if(err){
                console.log(err);
            } 
            else{
                console.log("Success");
            }
        });
        res.redirect("/");
    }else{
        res.render("list", {listName: "Today", newItems: foundItems});
    }
});
});


app.get("/:customList", function(req, res){
    const customListName = req.params.customList;


    List.findOne({name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+ customListName);
            } else {
                res.render("list", {listName: foundList.name, newItems: foundList.items})
            }
        }
    });
})


app.post("/", function(req, res){

    const itemName = req.body.newItem;
    const listName = req.body.button;

    console.log(listName);

    const item = new Item({
        name: itemName
    });
    
    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+ listName);
        });
    }    
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;
    
    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                console.log("Success");
                res.redirect("/");
            }
        })
    }else{
        
        List.findOneAndUpdate({name: listName}, {$pull:{items:{_id: checkedItemId}}}, function(err, foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        })

    } 
});


app.listen(3000, function(req,res){
    
    console.log("Server is running at port 3000.");
});