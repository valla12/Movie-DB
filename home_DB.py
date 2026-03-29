from extensions import db, api, key
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
    
    if data.get("Response") == "False":
        print(f"Skipping {movie}: API Error - {data.get('Error')}")
        continue
        
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

class Rating(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    poster = db.Column(db.String(100), nullable=False)
    stars = db.Column(db.Integer, nullable=False)
   
    def __init__(self, name, year, poster, stars):
        self.name = name
        self.year = year
        self.poster = poster
        self.stars = stars
    
    def save(self):
        db.session.add(self)
        db.session.commit()

class VersusStat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    imdb_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    poster = db.Column(db.String(250), nullable=False)
    wins = db.Column(db.Integer, default=0)
    losses = db.Column(db.Integer, default=0)

    def save(self):
        db.session.add(self)
        db.session.commit()
