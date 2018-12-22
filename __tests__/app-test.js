var should = require('chai').should(),
    expect = require('chai').expect,
    supertest = require('supertest'),
    api = supertest('http://localhost:8080');

describe('Todos', () => {

    describe('POST /todos', () => {
        it('should add a new task', (done) => {
            api.post('/todos')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({
                task: "Buy Milk"
            })
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
                console.log(res.body);
                done();
            });
        });
    });
    
    describe('GET /todos/refresh', () => {
        it('it should fetch todos as json', (done) => {
          api.get('/todos/refresh')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    console.log(res.body);
                    done();
              });
        });
    });
});