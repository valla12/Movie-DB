from __main__ import db
from __main__ import api,key
import requests


class Movie(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    poster = db.Column(db.String(100), nullable=False)

    def add_movie(self):
        db.session.add(self)
        db.session.commit()
    def __init__(self, name, year, poster):
        self.name = name
        self.year = year
        self.poster = poster




db.create_all()
lst = ["interstellar","inception","avatar","juno","titanic"]

for movie in lst:
    res = requests.get(api + movie + key)
    data = res.json()
    
    existing = Movie.query.filter_by(name=data["Title"]).first()
    if not existing:
        mov = Movie(data["Title"],data["Year"],data["Poster"])
        mov.add_movie()


class WatchLater(db.Model):
    id = db.Column(db.Integer,primary_key = True)
    name = db.Column(db.String(100),nullable = False)
    year = db.Column(db.Integer,nullable = False)
    poster = db.Column(db.String(100),nullable = False)
   
    def __init__(self, name, year, poster):
        self.name = name
        self.year = year
        self.poster = poster
    
    def add_movie(self):
        db.session.add(self)
        db.session.commit()


