'use strict';
var expect = require('chai').expect;
const mongodb = require("mongodb");
const mongoose = require("mongoose");

module.exports = function (app) {
mongoose.connect(process.env.DB,{ useNewUrlParser: true, useUnifiedTopology: true })

let IssueSchema = new mongoose.Schema({
    name: {type:String, required: true},
    issue_title: {type:String, required: true},
    issue_text: {type:String, required: true},
    created_on: Date,
    updated_on: Date,
    created_by: {type:String, required: true},
    assigned_to: String,
    open: Boolean,
    status_text: String
})

let Issue = mongoose.model("Issue",IssueSchema);

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      Issue.find({name: project})
           .select('-name')
           .exec((err,data)=>{
        if(err){
          console.log(err)
        }
        let allIssue = data;
        if(req.query._id != undefined){
          allIssue = allIssue.filter((x)=>{
            return x._id == req.query._id
          })
        }
        if(req.query.issue_title != undefined){
          allIssue = allIssue.filter((x)=>{
            return x.issue_title == req.query.issue_title
          })
        }
        if(req.query.issue_text != undefined){
          allIssue = allIssue.filter((x)=>{
            return x.issue_text == req.query.issue_text
          })
        }
        if(req.query.created_by != undefined){
          allIssue = allIssue.filter((x)=>{
            return x.created_by == req.query.created_by
          })
        }
        if(req.query.assigned_to != undefined){
          allIssue = allIssue.filter((x)=>{
            return x.assigned_to == req.query.assigned_to
          })
        }
        if(req.query.open != undefined){
          allIssue = allIssue.filter((x)=>{
            return x.open == req.query.open
          })
        }
        if(req.query.status_text != undefined){
          allIssue = allIssue.filter((x)=>{
            return x.status_text == req.query.status_text
          })
        }
        res.json(allIssue)
      })
    })
    
    .post(function (req, res){
      let project = req.params.project;
      if(!req.body.issue_title || !req.body.issue_text || !req.body.created_by){
         return res.json({error: 'required field(s) missing'});
      };
      let newIssue = new Issue({
        name : project,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: new Date(),
        updated_on: new Date(),
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        open: true,
        status_text: req.body.status_text || ""
      });
      newIssue.save((err,data)=>{
        if(err){
          console.log(error)
        }else{
          res.json({
            assigned_to: data.assigned_to,
            status_text: data.status_text,
            open: data.open,
            _id: data._id,
            issue_title: data.issue_title,
            issue_text: data.issue_text,
            created_by: data.created_by,
            created_on: data.created_on,
            updated_on: data.updated_on
          })
        }
      })
    })
    
    .put(function (req, res){
      let project = req.params.project;
      let body = req.body;
      Object.keys(body).forEach((key)=>{
        if(body[key] == ''){
          delete body[key]
        }
      })
      if(!req.body._id){
        return res.json({error: "missing _id"})
      }
      if(Object.keys(body).length < 2){
        return res.json({ error: 'no update field(s) sent', _id: req.body._id })
      }
      body['updated_on'] = new Date();
      Issue.findByIdAndUpdate(
        req.body._id,
        body,
        {new: true},
        (err,updatedData)=>{
          if(err || !updatedData){
            return res.json({ error: 'could not update', _id: req.body._id })
          }else{
            return res.json({  result: 'successfully updated', _id: req.body._id })
          }
        }
      )
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      if(!req.body._id){
        return res.json({ error: 'missing _id' })
      }
      Issue.findByIdAndRemove(req.body._id,(err,data)=>{
        if(err || !data){
          return res.json({ error: 'could not delete', _id: req.body._id })
        }else{
          return res.json({ result: 'successfully deleted', _id: req.body._id })
        }
      })
    });
    
};
