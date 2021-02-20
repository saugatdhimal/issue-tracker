const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let id1 = ''

suite('Functional Tests', function() {

  suite('3POSTS /api/issues/{project}',function(){
   test('Every field filled in', function(done) { 
    chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'FuncTest',
          assigned_to: 'Chai',
          status_text: 'In QA'
        })
        .end(function(err,res){
          assert.equal(res.status, 200);
          id1 = res.body._id
          assert.equal(res.body.issue_title, 'Title')
          assert.equal(res.body.issue_text, 'text')
          assert.equal(res.body.created_by, 'FuncTest')
          assert.equal(res.body.assigned_to, 'Chai')
          assert.equal(res.body.status_text, 'In QA')
          done();
        })
  })
    test('Required fields filled in', function(done) {
  chai.request(server)
  .post('/api/issues/test')
  .send({
    issue_title: 'Title',
    issue_text: 'text',
    created_by: 'FuncTest',
  })
  .end(function(err, res){
    assert.equal(res.status, 200);
    assert.equal(res.body.issue_title, 'Title')
    assert.equal(res.body.issue_text, 'text')
    assert.equal(res.body.created_by, 'FuncTest')
    assert.equal(res.body.assigned_to, '')
    assert.equal(res.body.status_text, '')
    done();
  })
  })

   test('Missing required fields', function(done) {
  chai.request(server)
  .post('/api/issues/test')
  .send({
    issue_title: 'Title'
  })
  .end(function(err, res){
    assert.equal(res.body.error, 'required field(s) missing')
		done()
  });
});
})

 suite("3GETS /api/issues/{project}",
      function() {
        test("No filter", function(done) {
          chai
            .request(server)
            .get("/api/issues/test")
            .query({})
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.isArray(res.body);
              assert.property(res.body[0], "issue_title");
              assert.property(res.body[0], "issue_text");
              assert.property(res.body[0], "created_on");
              assert.property(res.body[0], "updated_on");
              assert.property(res.body[0], "created_by");
              assert.property(res.body[0], "assigned_to");
              assert.property(res.body[0], "open");
              assert.property(res.body[0], "status_text");
              assert.property(res.body[0], "_id");
              done();
            });
        });

        test("One filter", function(done) {
          chai
            .request(server)
            .get("/api/issues/test")
            .query({ created_by: "FuncTest" })
            .end(function(err, res) {
              res.body.forEach(issueResult => {
                assert.equal(
                  issueResult.created_by,
                  "FuncTest"
                );
              });
              done();
            });
        });

        test("Multiple filters (test for multiple fields you know will be in the db for a return)", function(done) {
          chai
            .request(server)
            .get("/api/issues/test")
            .query({
              open: true,
              created_by: "FuncTest"
            })
            .end(function(err, res) {
              res.body.forEach(issueResult => {
                assert.equal(issueResult.open, true);
                assert.equal(
                  issueResult.created_by,
                  "FuncTest"
                );
              });
              done();
            });
        });
      });

  suite("5PUTS /api/issues/{project}", function() {
    test("Missing _id", function(done) {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({})
        .end(function(err, res) {
          assert.equal(res.body.error, 'missing _id');
          done();
        });
    });

    test("invalid _id", function(done) {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({_id:"6030a97invalid",issue_text: "new text"})
        .end(function(err, res) {
          assert.equal(res.body.error, 'could not update');
          done();
        });
    });

    test("No body", function(done) {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({_id:"6030a9799b8c4d013e542524"})
        .end(function(err, res) {
          assert.equal(res.body.error, "no update field(s) sent");
          done();
        });
    });

    test("One field to update", function(done) {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({
          _id:"6030a9799b8c4d013e542524",
          issue_text: "new text"
        })
        .end(function(err, res) {
          assert.equal(res.body.result, "successfully updated");
          done();
        });
    });

    test("Multiple fields to update", function(done) {
      chai
        .request(server)
        .put("/api/issues/apitest")
        .send({
          _id: "6030a9799b8c4d013e542524",
          issue_title: "new title",
          issue_text: "new text"
        })
        .end(function(err, res) {
          assert.equal(res.body.result, "successfully updated");
          done();
        });
    });
  });   

  suite("3DELETES /api/issues/{project}", function() {
      test("No _id", function(done) {
        chai
          .request(server)
          .delete("/api/issues/test")
          .send({})
          .end(function(err, res) {
            assert.equal(res.body.error, "missing _id");
            done();
          });
      });

      test("invalid _id", function(done) {
        chai
          .request(server)
          .delete("/api/issues/test")
          .send({_id: "866788invalid"})
          .end(function(err, res) {
            assert.equal(res.body.error, "could not delete");
            done();
          });
      });

      test("Valid _id", function(done) {
        chai
          .request(server)
          .delete("/api/issues/test")
          .send({
            _id: id1
          })
          .end(function(err, res) {
            assert.equal(res.body.result, "successfully deleted");
            done();
          });
      });
    });
  }); 
